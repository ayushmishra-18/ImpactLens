"use client";

import Link from "next/link";
import { IconRail } from "@/components/icon-rail";
import { UploadZone } from "@/components/upload-zone";
import { ShieldCheck, Cpu, HardDrive, CheckCircle2, ArrowRight } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-6 text-ink selection:bg-accent-blue/20">
      <IconRail />

      <main className="flex-1 ml-[88px] flex flex-col gap-6 max-w-[1400px]">
        {/* Header */}
        <header className="glass px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-ink">
                Bulk Upload & Evidence Ingestion
              </h1>
              <span className="glass-pill text-xs font-semibold text-accent-blue bg-white/80">
                Direct Signed Upload
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Destination: <code className="bg-white/60 px-1.5 py-0.5 rounded font-mono text-[11px]">impactlens/evidence-vault</code> (Immutable field ledger)
            </p>
          </div>

          <Link href="/library" className="btn-ghost text-xs shadow-sm">
            <span>View Ingested Media</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Dropzone & Live Pipeline */}
        <UploadZone />

        {/* Feature Explainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass p-5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-ink">
              Multi-Model AI Tagging
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Cloudinary AI categorization and Gemini 2.5 Flash Lite Vision detect sapling counts, waste categories, and environmental signals in real time.
            </p>
          </div>

          <div className="glass p-5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#3FBF8F]/20 text-[#17835b] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-ink">
              EXIF & Tamper Verification
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Cryptographic hashes, GPS geo-stamps, and hardware timestamps verify authenticity before media is accepted into project audit logs.
            </p>
          </div>

          <div className="glass p-5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-violet/20 text-accent-violet flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-ink">
              Zero-Overwrite Originals
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Raw master media is never altered. All crops, before/after alignments, and report overlays are generated dynamically via signed Cloudinary URLs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
