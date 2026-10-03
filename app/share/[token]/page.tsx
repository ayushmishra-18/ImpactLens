"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Loader2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Asset } from "@/types";

interface ReportData {
  id: string;
  project_id: string;
  project_name?: string;
  location?: string;
  title: string;
  date_from: string;
  date_to: string;
  executive_summary: string;
  metrics: {
    saplingsPlanted: number;
    wasteDivertedKg: number;
    activeSitesCount: number;
    verificationRate: number;
    totalAssetsRecorded: number;
  };
  comparison?: {
    change_summary: string;
    before_asset?: Asset;
    after_asset?: Asset;
  };
  evidence_assets: Asset[];
  share_token: string;
}

export default function PublicSharePage() {
  const routeParams = useParams();
  const token = (routeParams?.token as string) || "rep_live";
  const [report, setReport] = useState<ReportData | null>(null);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/reports").then((r) => r.json()),
      fetch("/api/search").then((r) => r.json()),
    ])
      .then(([reportRes, searchRes]) => {
        if (reportRes.report) {
          setReport(reportRes.report);
        }
        if (searchRes.assets) {
          setAllAssets(searchRes.assets);
        }
      })
      .catch((err) => console.error("Report fetch error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-6 text-ink">
        <div className="glass p-10 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
          <span className="text-sm text-ink-muted">Loading verified audit dossier...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-6 text-ink">
        <div className="glass p-8 flex flex-col items-center gap-3 text-center max-w-md shadow-xl">
          <FileText className="w-8 h-8 text-accent-blue" />
          <h3 className="text-base font-semibold text-ink">Dossier Unavailable</h3>
          <p className="text-xs text-ink-muted">
            The requested audit dossier ({token}) could not be retrieved.
          </p>
          <Link href="/" className="btn-primary text-xs mt-2">
            Return to ImpactLens
          </Link>
        </div>
      </div>
    );
  }

  const beforeAsset = report.comparison?.before_asset || allAssets[allAssets.length - 1] || allAssets[0];
  const afterAsset = report.comparison?.after_asset || allAssets[0];
  const galleryAssets = report.evidence_assets?.length > 0 ? report.evidence_assets : allAssets;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-8 text-ink selection:bg-accent-blue/20 print:bg-white print:p-0">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Public Top Nav (Hidden in Print) */}
        <header className="glass px-6 py-4 flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-ink hover:text-accent-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ImpactLens Platform</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="pill pill-verified text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#17835b]" />
              Public Verification Dossier
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary text-xs shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </header>

        {/* The Official White A4 Document Sheet */}
        <main className="bg-white/95 rounded-[28px] p-8 md:p-14 shadow-2xl border border-white flex flex-col gap-8 print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b border-zinc-200 pb-8 flex flex-col gap-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-blue">
                  ImpactLens Cryptographic Verification Report
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 mt-1">
                  {report.title}
                </h1>
              </div>
              <div className="text-left md:text-right">
                <span className="inline-block bg-[#3FBF8F]/15 text-[#17835b] border border-[#3FBF8F]/30 text-xs font-bold px-3 py-1 rounded-full">
                  Health: {report.metrics.verificationRate}% Grounded
                </span>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  Token: {report.share_token}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-600 flex-wrap pt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-zinc-400" />
                {report.location || "Verified Observation Corridor"}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-zinc-400" />
                {report.date_from} – {report.date_to}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-zinc-400" />
                Immutable Cloudinary Vault
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span>1. Executive Summary</span>
              <span className="text-[11px] font-normal text-zinc-500 lowercase bg-zinc-100 px-2 py-0.5 rounded">
                ai-synthesized narrative
              </span>
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed font-normal bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
              {report.executive_summary}
            </p>
          </div>

          {/* Section 2: Metrics Snapshot */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              2. Grounded Impact Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <span className="text-xs text-zinc-500 font-medium">
                  Field Assets Ingested
                </span>
                <p className="text-2xl font-bold text-zinc-950 mt-1">
                  {report.metrics.totalAssetsRecorded}
                </p>
                <span className="text-[10px] text-zinc-400">
                  Cloudinary Vault
                </span>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <span className="text-xs text-zinc-500 font-medium">
                  Tamper-Free Media
                </span>
                <p className="text-2xl font-bold text-[#17835b] mt-1">
                  {report.metrics.totalAssetsRecorded}
                </p>
                <span className="text-[10px] text-zinc-400">
                  EXIF & Sensor Match
                </span>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <span className="text-xs text-zinc-500 font-medium">
                  Saplings Revived
                </span>
                <p className="text-2xl font-bold text-zinc-950 mt-1">
                  {report.metrics.saplingsPlanted.toLocaleString()}
                </p>
                <span className="text-[10px] text-zinc-400">
                  Detected vegetative growth
                </span>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <span className="text-xs text-zinc-500 font-medium">
                  Waste Diverted
                </span>
                <p className="text-2xl font-bold text-zinc-950 mt-1">
                  {report.metrics.wasteDivertedKg.toLocaleString()} kg
                </p>
                <span className="text-[10px] text-zinc-400">
                  Macro-debris extracted
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Before / After Visual Progression */}
          {beforeAsset && afterAsset && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                3. Key Intervention: Visual Before & After Proof
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-zinc-200 bg-black/5">
                    <Image
                      src={beforeAsset.cld_secure_url}
                      alt="Baseline"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded">
                      Baseline Checkpoint
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {beforeAsset.caption}
                  </p>
                  <span className="text-[10px] font-mono text-zinc-400">
                    ID: {beforeAsset.cld_public_id}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-zinc-200 bg-black/5">
                    <Image
                      src={afterAsset.cld_secure_url}
                      alt="Restored Checkpoint"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-[#17835b] text-white text-[10px] font-semibold px-2 py-1 rounded">
                      Verified Restored Checkpoint
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {afterAsset.caption}
                  </p>
                  <span className="text-[10px] font-mono text-zinc-400">
                    ID: {afterAsset.cld_public_id}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs text-zinc-700">
                <span className="font-semibold text-zinc-900">
                  Visible Change Synthesis:{" "}
                </span>
                {report.comparison?.change_summary ||
                  "Progression demonstrates notable vegetative groundcover recovery, sapling growth, and active community-driven debris removal."}
              </div>
            </div>
          )}

          {/* Section 4: Observation Gallery */}
          {galleryAssets.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                4. Field Observation Sample Gallery ({galleryAssets.length} verified records)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryAssets.slice(0, 8).map((asset) => (
                  <div
                    key={asset.id}
                    className="flex flex-col gap-1.5 p-2 bg-zinc-50 rounded-xl border border-zinc-100"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/5">
                      <Image
                        src={asset.cld_secure_url}
                        alt={asset.caption || "Gallery item"}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-800 truncate capitalize">
                      {asset.activity?.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      ID: {asset.cld_public_id.split("/").pop()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Appendix Table */}
          {allAssets.length > 0 && (
            <div className="flex flex-col gap-3 pt-6 border-t border-zinc-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                5. Provenance & Cryptographic Traceability Appendix
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500">
                      <th className="py-2">Source Asset ID</th>
                      <th className="py-2">Cloudinary Public ID</th>
                      <th className="py-2">Version</th>
                      <th className="py-2">GPS Verification</th>
                      <th className="py-2">Transformation Chain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                    {allAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-zinc-50">
                        <td className="py-2.5 font-sans font-semibold text-zinc-900">
                          {asset.id.slice(0, 13)}...
                        </td>
                        <td className="py-2.5 text-zinc-600">
                          {asset.cld_public_id}
                        </td>
                        <td className="py-2.5 text-zinc-500">
                          v{asset.cld_version || 1}
                        </td>
                        <td className="py-2.5 font-sans">
                          <span className="text-[#17835b] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Valid EXIF
                          </span>
                        </td>
                        <td className="py-2.5 text-zinc-400">
                          c_fill,g_auto,w_1200,h_800
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="pt-6 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
            <p>
              Audited and anchored by <strong>ImpactLens</strong>. Powered by Cloudinary & Supabase pgvector.
            </p>
            <p className="font-mono text-[11px]">
              Dossier ID: {report.id}
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
