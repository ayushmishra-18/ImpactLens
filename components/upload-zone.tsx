"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  Sparkles,
  FolderCheck,
  AlertCircle,
  ArrowRight,
  MapPin,
  Camera,
  Navigation,
  Check,
  SplitSquareVertical,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import exifr from "exifr";

interface UploadingFile {
  id: string;
  name: string;
  size: string;
  previewUrl: string;
  progress: number;
  stage: "uploading" | "analyzing" | "organized" | "error";
  detectedActivity?: string;
  caption?: string;
  tags?: string[];
  publicId?: string;
  assetId?: string;
  errorMessage?: string;
  device?: string;
  gpsLat?: number;
  gpsLng?: number;
  gpsSource?: "exif" | "device" | "site";
  capturedAt?: string;
}

interface Site {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export function UploadZone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadingFile[]>([]);

  // Dynamic sites from Supabase
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  // Fetch available sites on mount
  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => {
        if (data.sites && data.sites.length > 0) {
          setSites(data.sites);
          setSelectedSiteId(data.sites[0].id);
        }
      })
      .catch((err) => console.error("Failed to load sites for upload:", err));
  }, []);

  const handleLiveUpload = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    for (const file of filesArray) {
      const fileId = `upl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";

      // ── Step A: Extract Hardware & GPS from EXIF client-side (No synthetic fallbacks) ──
      let detectedDevice: string | undefined = undefined;
      let detectedGpsLat: number | undefined = undefined;
      let detectedGpsLng: number | undefined = undefined;
      let detectedCapturedAt: string | undefined = undefined;

      try {
        const exifData = await exifr.parse(file, {
          tiff: true,
          exif: true,
          gps: true,
        });

        if (exifData) {
          // 1. Authentic Camera Hardware from EXIF
          const make = exifData.Make ? String(exifData.Make).trim() : "";
          const model = exifData.Model ? String(exifData.Model).trim() : "";
          if (model) {
            detectedDevice = make && !model.toLowerCase().includes(make.toLowerCase()) ? `${make} ${model}` : model;
          } else if (make) {
            detectedDevice = make;
          }

          // 2. Authentic Embedded GPS from EXIF
          if (typeof exifData.latitude === "number" && typeof exifData.longitude === "number") {
            detectedGpsLat = exifData.latitude;
            detectedGpsLng = exifData.longitude;
          }

          // 3. Authentic Captured Timestamp from EXIF
          if (exifData.DateTimeOriginal instanceof Date) {
            detectedCapturedAt = exifData.DateTimeOriginal.toISOString();
          } else if (typeof exifData.DateTimeOriginal === "string") {
            const parsed = new Date(exifData.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3"));
            if (!isNaN(parsed.getTime())) detectedCapturedAt = parsed.toISOString();
          }
        }
      } catch (err) {
        console.warn("Client EXIF extraction skipped:", err);
      }

      const newFileItem: UploadingFile = {
        id: fileId,
        name: file.name,
        size: sizeMb,
        previewUrl,
        progress: 15,
        stage: "uploading",
        device: detectedDevice,
        gpsLat: detectedGpsLat,
        gpsLng: detectedGpsLng,
        capturedAt: detectedCapturedAt,
      };

      setFiles((prev) => [newFileItem, ...prev]);

      try {
        const selectedSite = sites.find((s) => s.id === selectedSiteId);
        const folderSlug = selectedSite?.name
          ? selectedSite.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
          : "evidence-vault";
        const targetFolder = `impactlens/${folderSlug}`;

        // Step 1: Fetch signed upload signature from backend
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: targetFolder }),
        });
        const signData = await signRes.json();

        if (signData.error) {
          throw new Error(signData.error);
        }

        // Step 2: Upload directly to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.apiKey);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
        formData.append("folder", signData.folder);

        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: 45 } : f))
        );

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error?.message || "Cloudinary upload failed");
        }

        const secureUrl = uploadData.secure_url;
        const publicId = uploadData.public_id;

        // Revoke temporary blob URL once Cloudinary URL is ready to free memory
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
          // ignore
        }

        // Step 3: Transition to AI Analysis (Gemini Vision)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  progress: 75,
                  stage: "analyzing",
                  publicId,
                  previewUrl: secureUrl,
                }
              : f
          )
        );

        // Call AI enrichment API and sync with Supabase
        const enrichRes = await fetch("/api/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secure_url: secureUrl,
            public_id: publicId,
            cld_asset_id: uploadData.asset_id,
            version: uploadData.version,
            resource_type: uploadData.resource_type,
            format: uploadData.format,
            bytes: uploadData.bytes,
            width: uploadData.width,
            height: uploadData.height,
            etag: uploadData.etag,
            original_filename: uploadData.original_filename || file.name,
            site_id: selectedSiteId || undefined,
            gps_lat: detectedGpsLat,
            gps_lng: detectedGpsLng,
            device: detectedDevice,
            captured_at: detectedCapturedAt,
          }),
        });

        const enrichData = await enrichRes.json();
        if (!enrichRes.ok) {
          throw new Error(enrichData.error || `AI analysis failed with HTTP ${enrichRes.status}`);
        }
        const enrichment = enrichData.enrichment || {};

        // Step 4: Complete and Organized
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  progress: 100,
                  stage: "organized",
                  assetId: enrichData.asset?.id,
                  detectedActivity: enrichment.activity || "site_assessment",
                  caption: enrichment.caption,
                  tags: enrichment.tags || ["verified"],
                  errorMessage: undefined,
                }
              : f
          )
        );
      } catch (err: unknown) {
        console.error("Live upload or analysis failed:", err);
        const msg = err instanceof Error ? err.message : "Upload error";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, stage: "error", errorMessage: msg }
              : f
          )
        );
      }
    }
  };

  const retryAnalysis = async (fileItem: UploadingFile) => {
    if (!fileItem.previewUrl || !fileItem.publicId) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileItem.id
          ? { ...f, stage: "analyzing", progress: 75, errorMessage: undefined }
          : f
      )
    );

    try {
      const enrichRes = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secure_url: fileItem.previewUrl,
          public_id: fileItem.publicId,
          site_id: selectedSiteId || undefined,
          gps_lat: fileItem.gpsLat,
          gps_lng: fileItem.gpsLng,
          device: fileItem.device,
          captured_at: fileItem.capturedAt,
        }),
      });

      const enrichData = await enrichRes.json();
      if (!enrichRes.ok) {
        throw new Error(enrichData.error || `AI analysis failed with HTTP ${enrichRes.status}`);
      }
      const enrichment = enrichData.enrichment || {};

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                progress: 100,
                stage: "organized",
                assetId: enrichData.asset?.id,
                detectedActivity: enrichment.activity || "site_assessment",
                caption: enrichment.caption,
                tags: enrichment.tags || ["verified"],
                errorMessage: undefined,
              }
            : f
        )
      );
    } catch (err: unknown) {
      console.error("Retry analysis failed:", err);
      const msg = err instanceof Error ? err.message : "Retry failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, stage: "error", errorMessage: msg }
            : f
        )
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleLiveUpload(e.target.files);
          }
        }}
      />

      {/* Configuration & Geolocation Sensor Bar */}
      <div className="glass p-5 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80 shadow-md">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Site Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Target Site:
            </span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="glass-pill text-xs font-semibold text-ink bg-white/90 border border-white focus:outline-none cursor-pointer py-1.5 px-3"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} {site.latitude ? `(${site.latitude.toFixed(3)}°N)` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Authentic Sensor Ingestion Badge */}
          <div className="flex items-center gap-2">
            <span className="pill pill-verified text-xs font-semibold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-accent-violet" />
              <span>Authentic Camera Sensor Ingestion</span>
            </span>
            <span className="text-[11px] text-ink-muted hidden md:inline">
              Extracts genuine camera make/model & GPS from binary EXIF headers.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-ink-muted bg-white/60 px-3 py-1.5 rounded-full border border-white">
          <ShieldCheck className="w-3.5 h-3.5 text-[#17835b]" />
          <span>No Synthetic Geotags: True EXIF Only</span>
        </div>
      </div>

      {/* Big Dashed Glass Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) {
            handleLiveUpload(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`glass p-10 border-2 border-dashed rounded-[28px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? "border-accent-blue bg-white/70 scale-[1.01]"
            : "border-white/80 hover:border-accent-blue/60 hover:bg-white/50"
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-accent-blue/15 text-accent-blue flex items-center justify-center mb-4 shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-ink">
          Drop field photos & videos here
        </h3>
        <p className="text-xs text-ink-muted mt-1 max-w-md leading-relaxed">
          Uploads directly to Cloudinary Secure Vault with signed credentials, client-side EXIF/GPS extraction, Gemini 2.5 Flash Lite Vision, and 768-d pgvector indexing.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="btn-primary text-xs shadow-md"
          >
            Select Files from Device
          </button>
          <span className="text-xs text-ink-muted">or drag & drop anywhere in this box</span>
        </div>
      </div>

      {/* Uploading Queue & 3-Step Pill Trail */}
      <div className="glass p-6 rounded-[28px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Live Enrichment Pipeline
          </span>
          <span className="text-xs font-semibold text-ink">
            {files.length} In-Flight Media Batches
          </span>
        </div>

        <div className="flex flex-col divide-y divide-white/50">
          {files.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-1.5 text-xs text-ink-muted">
              <span className="font-medium text-ink/70">No uploads in current session</span>
              <span>Drop field media above to start live signed Cloudinary upload & Gemini analysis</span>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                {/* File Info & Detected Sensors */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/80 shadow-sm bg-black/5 mt-0.5">
                    <Image
                      src={file.previewUrl}
                      alt={file.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink truncate max-w-sm">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {file.size} •{" "}
                      {file.detectedActivity
                        ? file.detectedActivity.replace(/_/g, " ")
                        : file.stage === "uploading"
                        ? "Uploading to Cloudinary..."
                        : "Analyzing with Gemini Vision..."}
                    </p>

                    {/* Sensor Badges: Device & GPS */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {file.device ? (
                        <span className="pill text-[10px] bg-emerald-50 border border-emerald-500/30 text-emerald-800 font-medium flex items-center gap-1 py-0.5 px-2">
                          <Camera className="w-3 h-3 text-emerald-600" />
                          <span>{file.device}</span>
                        </span>
                      ) : (
                        <span className="pill text-[10px] bg-white/70 border border-white text-ink-muted flex items-center gap-1 py-0.5 px-2">
                          <span>No Camera Model in EXIF</span>
                        </span>
                      )}
                      {file.gpsLat != null && file.gpsLng != null ? (
                        <span className="pill text-[10px] bg-emerald-50 border border-emerald-500/30 text-emerald-800 font-medium flex items-center gap-1 py-0.5 px-2">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>
                            {file.gpsLat.toFixed(4)}°N, {file.gpsLng.toFixed(4)}°E (Camera Geotag)
                          </span>
                        </span>
                      ) : (
                        <span className="pill text-[10px] bg-white/70 border border-white text-ink-muted flex items-center gap-1 py-0.5 px-2">
                          <span>No GPS Geotag in file</span>
                        </span>
                      )}
                    </div>

                    {file.caption && (
                      <p className="text-[11px] text-[#17835b] font-medium mt-1.5 line-clamp-1 italic">
                        &ldquo;{file.caption}&rdquo;
                      </p>
                    )}
                    {file.errorMessage && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {file.errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3-Step Pill Trail + Action Links */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Step 1: Uploaded */}
                  <div
                    className={`pill text-[11px] transition-all ${
                      file.stage === "uploading"
                        ? "pill-pending animate-pulse"
                        : file.stage === "error" && !file.publicId
                        ? "pill-warning"
                        : "pill-verified font-medium"
                    }`}
                  >
                    {file.stage === "uploading" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : file.stage === "error" && !file.publicId ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-[#17835b]" />
                    )}
                    <span>Uploaded</span>
                  </div>

                  <span className="w-2.5 h-0.5 bg-ink/20" />

                  {/* Step 2: Analyzing */}
                  <div
                    className={`pill text-[11px] transition-all ${
                      file.stage === "analyzing"
                        ? "pill-pending animate-pulse"
                        : file.stage === "error" && file.publicId
                        ? "pill-warning text-red-700 bg-red-50 border-red-200"
                        : file.stage === "organized"
                        ? "pill-verified font-medium"
                        : "pill-done text-ink/40"
                    }`}
                  >
                    {file.stage === "analyzing" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : file.stage === "error" && file.publicId ? (
                      <AlertCircle className="w-3 h-3 text-red-600" />
                    ) : file.stage === "organized" ? (
                      <Sparkles className="w-3 h-3 text-[#17835b]" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-ink/30" />
                    )}
                    <span>{file.stage === "error" && file.publicId ? "Analysis Error" : "Analyzing"}</span>
                  </div>

                  <span className="w-2.5 h-0.5 bg-ink/20" />

                  {/* Step 3: Organized */}
                  <div
                    className={`pill text-[11px] transition-all ${
                      file.stage === "organized"
                        ? "pill-verified font-medium"
                        : "pill-done text-ink/40"
                    }`}
                  >
                    {file.stage === "organized" ? (
                      <FolderCheck className="w-3 h-3 text-[#17835b]" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-ink/30" />
                    )}
                    <span>Organized</span>
                  </div>

                  {/* Retry Analysis Button */}
                  {file.stage === "error" && file.publicId && (
                    <button
                      type="button"
                      onClick={() => retryAnalysis(file)}
                      className="btn-secondary text-[11px] py-1 px-3 rounded-full flex items-center gap-1.5 shadow-sm text-accent-blue font-semibold hover:bg-white hover:scale-105 transition-all ml-1 border border-accent-blue/30"
                      title="Retry AI analysis with Gemini Vision"
                    >
                      <Sparkles className="w-3 h-3 text-accent-blue" />
                      <span>Retry AI</span>
                    </button>
                  )}

                  {/* Interactive Action Links */}
                  {file.stage === "organized" && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <Link
                        href="/library"
                        className="btn-secondary text-[11px] py-1 px-3 rounded-full flex items-center gap-1 shadow-sm hover:scale-105 transition-all text-accent-blue font-semibold hover:bg-white"
                        title="View this asset in the Evidence Library"
                      >
                        <span>View Library</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        href={file.assetId ? `/compare?before=${file.assetId}` : "/compare"}
                        className="btn-ghost text-[11px] py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm text-ink hover:bg-white/60"
                        title="Compare with baseline"
                      >
                        <SplitSquareVertical className="w-3 h-3" />
                        <span className="hidden sm:inline">Compare</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
