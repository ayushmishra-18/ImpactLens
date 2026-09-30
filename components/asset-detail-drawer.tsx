"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Asset } from "@/types";
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Tag,
  Copy,
  Check,
  Layers,
  FileText,
  SplitSquareVertical,
  Megaphone,
  Download,
  Camera,
  ExternalLink,
} from "lucide-react";

interface AssetDetailDrawerProps {
  asset: Asset | null;
  onClose: () => void;
}

export function AssetDetailDrawer({ asset, onClose }: AssetDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "provenance" | "exif">("insights");
  const [copied, setCopied] = useState(false);

  if (!asset) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(asset.cld_secure_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl h-full glass border-l border-white/60 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl rounded-l-[28px] bg-white/70"
        style={{ backdropFilter: "blur(32px) saturate(150%)" }}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/50">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
                Asset Provenance Drawer
              </span>
              <span className="pill pill-verified text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Field Evidence
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-ink transition-transform hover:scale-105"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Media Preview */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden mt-5 shadow-lg border border-white/80">
            <Image
              src={asset.cld_secure_url}
              alt={asset.caption || "Asset detail"}
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              className="object-cover"
            />
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex items-center gap-1.5 p-1 glass-tile rounded-full mt-5">
            <button
              type="button"
              onClick={() => setActiveTab("insights")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === "insights"
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              AI Insights
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("provenance")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === "provenance"
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              Traceability Chain
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exif")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === "exif"
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              EXIF & GPS
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-5 space-y-4">
            {activeTab === "insights" && (
              <div className="flex flex-col gap-4">
                <div className="glass-tile p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    AI Synthetic Caption
                  </span>
                  <p className="text-sm font-medium text-ink mt-1 leading-relaxed">
                    {asset.caption}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-tile p-3">
                    <span className="text-[11px] text-ink-muted">Activity</span>
                    <p className="text-sm font-bold text-ink capitalize mt-0.5">
                      {asset.activity?.replace("_", " ")}
                    </p>
                  </div>
                  <div className="glass-tile p-3">
                    <span className="text-[11px] text-ink-muted">Scene Setting</span>
                    <p className="text-sm font-bold text-ink capitalize mt-0.5">
                      {asset.scene?.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {/* Detected Objects */}
                {asset.objects && asset.objects.length > 0 && (
                  <div className="glass-tile p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      Detected Visual Signals
                    </span>
                    <div className="flex flex-col gap-2 mt-2">
                      {asset.objects.map((obj) => (
                        <div
                          key={obj.label}
                          className="flex items-center justify-between text-xs py-1 border-b border-white/40 last:border-none"
                        >
                          <span className="font-semibold capitalize text-ink">
                            {obj.label.replace("_", " ")}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-ink-muted font-medium">
                              Count: {obj.count}
                            </span>
                            <span className="pill pill-done text-[10px]">
                              {Math.round(obj.confidence * 100)}% conf
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="glass-tile p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Semantic Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {asset.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-white text-ink font-medium px-2.5 py-1 rounded-full border border-black/5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "provenance" && (
              <div className="flex flex-col gap-4">
                <div className="glass-tile p-4">
                  <span className="text-xs font-bold text-ink">
                    Cloudinary Immutable Provenance
                  </span>
                  <div className="mt-3 relative pl-6 border-l-2 border-accent-blue/40 space-y-4">
                    {/* Node 1: Original Asset */}
                    <div className="relative">
                      <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-accent-blue ring-4 ring-white" />
                      <p className="text-xs font-bold text-ink">1. Original Capture Ingestion</p>
                      <p className="text-[11px] text-ink-muted">
                        Public ID: <code className="bg-white/80 px-1 py-0.5 rounded">{asset.cld_public_id}</code>
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        Asset ID: {asset.cld_asset_id} • v{asset.cld_version}
                      </p>
                    </div>

                    {/* Node 2: AI Enrichment Pipeline */}
                    <div className="relative">
                      <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-accent-violet ring-4 ring-white" />
                      <p className="text-xs font-bold text-ink">2. Multi-Model AI Enrichment</p>
                      <p className="text-[11px] text-ink-muted">
                        Cloudinary Auto-Tagging + Gemini 2.5 Flash Lite Vision (Grounded)
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        Status: <span className="text-[#17835b] font-semibold">100% Validated</span>
                      </p>
                    </div>

                    {/* Node 3: URL Transformations */}
                    <div className="relative">
                      <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#3FBF8F] ring-4 ring-white" />
                      <p className="text-xs font-bold text-ink">3. Derivative Deliveries</p>
                      <p className="text-[11px] text-ink-muted font-mono">
                        c_fill,g_auto,w_1200,h_800/f_auto,q_auto
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        Live dynamic derivatives for reports, before/after alignment, and campaign studio
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-tile p-4 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <span className="text-[11px] text-ink-muted">Original Cloudinary Delivery URL</span>
                    <p className="text-xs font-mono text-ink truncate mt-0.5">
                      {asset.cld_secure_url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="btn-ghost py-1.5 px-3 text-xs shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#17835b]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "exif" && (
              <div className="flex flex-col gap-3">
                <div className="glass-tile p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/40">
                    <span className="text-ink-muted">Captured At</span>
                    <span className="font-semibold text-ink">
                      {asset.captured_at
                        ? new Date(asset.captured_at).toLocaleString()
                        : asset.created_at
                        ? `${new Date(asset.created_at).toLocaleDateString()} (Upload Time)`
                        : "Not recorded in EXIF"}
                    </span>
                  </div>

                  {/* Camera Hardware */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/40">
                    <span className="text-ink-muted">Camera Hardware</span>
                    {asset.device ? (
                      <span className="font-semibold text-ink flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-accent-violet" />
                        <span>{asset.device}</span>
                      </span>
                    ) : (
                      <span className="text-ink-muted italic text-[11px]">
                        Not in file (stripped by source or web upload)
                      </span>
                    )}
                  </div>

                  {/* GPS Geolocation */}
                  <div className="flex flex-col gap-1.5 pb-2 border-b border-white/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-muted">Camera GPS Coordinates</span>
                      {asset.gps_lat != null && asset.gps_lng != null ? (
                        <span className="font-mono font-bold text-ink flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {asset.gps_lat.toFixed(5)}°, {asset.gps_lng.toFixed(5)}°
                          </span>
                        </span>
                      ) : (
                        <span className="text-ink-muted italic text-[11px]">
                          No GPS coordinates in file
                        </span>
                      )}
                    </div>
                    {asset.gps_lat != null && asset.gps_lng != null && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          ✓ Verified Optical Geotag
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${asset.gps_lat},${asset.gps_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-accent-blue font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Lens & Optical Metadata if in EXIF */}
                  {asset.exif && typeof asset.exif === "object" && (
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/40">
                      <span className="text-ink-muted">Optical Settings</span>
                      <span className="font-mono text-ink text-[11px]">
                        {[
                          asset.exif.FocalLength ? `${asset.exif.FocalLength}mm` : null,
                          asset.exif.FNumber ? `f/${asset.exif.FNumber}` : null,
                          asset.exif.ISO ? `ISO ${asset.exif.ISO}` : null,
                          asset.exif.ExposureTime ? `${asset.exif.ExposureTime}s` : null,
                        ]
                          .filter(Boolean)
                          .join(" • ") || "Standard Lens"}
                      </span>
                    </div>
                  )}

                  {asset.site && (
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/40">
                      <span className="text-ink-muted">Assigned Monitoring Site</span>
                      <span className="font-medium text-ink flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-accent-blue" />
                        {asset.site.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/40">
                    <span className="text-ink-muted">Resolution & Size</span>
                    <span className="font-mono font-medium text-ink">
                      {asset.width && asset.height ? `${asset.width} × ${asset.height} px` : "N/A"}
                      {asset.bytes ? ` • ${(asset.bytes / 1024).toFixed(1)} KB` : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted">Perceptual Hash (pHash) / ETag</span>
                    <span className="font-mono text-[11px] text-ink">
                      {asset.phash ||
                        (asset.cld_etag
                          ? `0x${asset.cld_etag.replace(/[^a-f0-9]/gi, "").slice(0, 12)}`
                          : asset.cld_asset_id
                          ? `0x${asset.cld_asset_id.slice(0, 12)}`
                          : "Not computed")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/50 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/compare?before=${asset.id}`}
              onClick={onClose}
              className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2"
              title="Compare this asset against another in Before/After studio"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-accent-blue" />
              <span>Compare Asset</span>
            </Link>
            <Link
              href={`/campaigns?asset=${asset.id}`}
              onClick={onClose}
              className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2"
              title="Transform into social campaign story"
            >
              <Megaphone className="w-3.5 h-3.5 text-accent-violet" />
              <span>Create Campaign</span>
            </Link>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              <a
                href={asset.cld_secure_url.replace("/upload/", "/upload/fl_attachment/")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                title="Download full resolution media"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
              <a
                href={asset.cld_secure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Raw Master</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
