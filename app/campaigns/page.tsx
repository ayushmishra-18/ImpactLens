"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IconRail } from "@/components/icon-rail";
import { Asset } from "@/types";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Megaphone,
  Layers,
  Sliders,
  Type,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

type TemplateType = "1:1" | "4:5" | "9:16" | "16:9";

function CampaignsContent() {
  const searchParams = useSearchParams();
  const assetParam = searchParams.get("asset");

  const [template, setTemplate] = useState<TemplateType>("1:1");
  const [headline, setHeadline] = useState("Restoration Progress Verified");
  const [subheadline, setSubheadline] = useState("Mithi River Ecological Corridor • 96% Verified");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real assets from Supabase
  useEffect(() => {
    fetch("/api/search")
      .then((r) => r.json())
      .then((data) => {
        if (data.assets && data.assets.length > 0) {
          const list: Asset[] = data.assets;
          setAssets(list);
          const initial = assetParam ? list.find((a) => a.id === assetParam) || list[0] : list[0];
          setSelectedAsset(initial);
          if (initial.caption) {
            setHeadline(initial.caption.slice(0, 45));
          }
        }
      })
      .catch((err) => console.error("Failed to fetch campaign assets:", err))
      .finally(() => setIsLoading(false));
  }, [assetParam]);

  const copyUrl = () => {
    if (!selectedAsset) return;
    navigator.clipboard.writeText(selectedAsset.cld_secure_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aspectClass =
    template === "1:1"
      ? "aspect-square max-w-[460px]"
      : template === "4:5"
      ? "aspect-[4/5] max-w-[420px]"
      : template === "9:16"
      ? "aspect-[9/16] max-w-[360px]"
      : "aspect-[16/9] max-w-[620px]";

  if (isLoading || !selectedAsset) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-6 text-ink">
        <IconRail />
        <main className="flex-1 ml-[88px] flex items-center justify-center">
          <div className="glass p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            <span className="text-sm text-ink-muted">Loading live field evidence...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-6 text-ink selection:bg-accent-blue/20">
      <IconRail />

      <main className="flex-1 ml-[88px] flex flex-col gap-6 max-w-[1600px]">
        {/* Header */}
        <header className="glass px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-ink">
                Campaign Studio & Cloudinary Overlays
              </h1>
              <span className="glass-pill text-xs font-semibold text-accent-violet bg-white/80">
                Dynamic URL Transformations
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Create instant donor cards, Instagram story reels, and LinkedIn proof updates with smart typography overlays.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyUrl}
              className="btn-ghost text-xs shadow-sm hover:scale-105 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#17835b]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "URL Copied" : "Copy Delivery URL"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const downloadUrl = selectedAsset.cld_secure_url.replace(
                  "/upload/",
                  "/upload/fl_attachment/"
                );
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = `impactlens-campaign-${template.replace(":", "x")}.jpg`;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="btn-primary text-xs shadow-md hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Campaign Card</span>
            </button>
          </div>
        </header>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Controls (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Format Chooser */}
            <div className="glass p-6 flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
                1. Select Ratio & Channel
              </span>

              <div className="grid grid-cols-4 gap-2 mt-1">
                {(["1:1", "4:5", "9:16", "16:9"] as TemplateType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      template === t
                        ? "bg-ink text-white shadow-md scale-105"
                        : "glass-pill text-ink hover:bg-white/80 cursor-pointer"
                    }`}
                  >
                    <span>{t}</span>
                    <span className="text-[10px] font-normal opacity-70">
                      {t === "1:1"
                        ? "Square"
                        : t === "4:5"
                        ? "Portrait"
                        : t === "9:16"
                        ? "Story"
                        : "Banner"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Overlays */}
            <div className="glass p-6 flex flex-col gap-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
                2. Card Headlines & Grounded Text
              </span>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-accent-blue" />
                  Primary Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. 3,200 Mangrove Saplings Restored"
                  className="bg-white/70 border border-white/80 rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-blue/30 shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-accent-violet" />
                  Sub-headline / Provenance
                </label>
                <input
                  type="text"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="e.g. Mithi River Ecological Corridor • 96% Verified"
                  className="bg-white/70 border border-white/80 rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-violet/30 shadow-inner"
                />
              </div>
            </div>

            {/* Evidence Picker from Real Library */}
            <div className="glass p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
                  3. Select Visual Evidence ({assets.length} Ingested)
                </span>
                <span className="text-[11px] text-accent-blue font-semibold">
                  Live DB Assets
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 mt-1">
                {assets.slice(0, 8).map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset);
                      if (asset.caption) {
                        setHeadline(asset.caption.slice(0, 45));
                      }
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedAsset.id === asset.id
                        ? "border-accent-blue scale-105 shadow-md ring-2 ring-accent-blue/30"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={asset.cld_secure_url}
                      alt={asset.caption || "Thumbnail"}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Live Canvas (Span 7) */}
          <div className="lg:col-span-7 glass p-8 flex flex-col items-center justify-center min-h-[580px]">
            {/* The Live Rendered Card with Overlays */}
            <div
              className={`relative w-full rounded-[28px] overflow-hidden shadow-2xl border-2 border-white/80 select-none ${aspectClass}`}
            >
              <Image
                src={selectedAsset.cld_secure_url}
                alt="Campaign Background"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />

              {/* Gradient Vignette for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

              {/* Top Branding Pill */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                <div className="bg-white/20 backdrop-blur-md border border-white/40 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#3FBF8F]" />
                  ImpactLens • Verified Evidence
                </div>
                <div className="bg-black/40 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-full text-[10px] font-mono">
                  {selectedAsset.activity?.replace(/_/g, " ")}
                </div>
              </div>

              {/* Bottom Overlaid Typography */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 z-10 text-white">
                <div className="flex items-center gap-2">
                  <span className="bg-[#3FBF8F] text-zinc-900 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    Tamper-Evident Proof
                  </span>
                  <span className="text-[11px] text-white/70">
                    ID: {selectedAsset.cld_public_id.split("/").pop()}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold leading-snug drop-shadow-md">
                  {headline}
                </h2>

                <p className="text-xs text-white/80 font-medium">
                  {subheadline}
                </p>
              </div>
            </div>

            {/* Transformation Info Strip */}
            <p className="text-[11px] font-mono text-ink-muted mt-5 text-center max-w-md">
              Transformation applied dynamically:
              <br />
              <code className="text-[10px] text-ink bg-white/70 px-1.5 py-0.5 rounded">
                c_fill,{template === "1:1" ? "w_1080,h_1080" : template === "9:16" ? "w_1080,h_1920" : "w_1200,h_800"},g_auto/l_text:Inter_44_bold:{encodeURIComponent(headline.slice(0, 20))}/f_auto,q_auto
              </code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-6 text-ink">
          <IconRail />
          <main className="flex-1 ml-[88px] flex items-center justify-center">
            <div className="glass p-10 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
              <span className="text-sm text-ink-muted">Loading campaign studio...</span>
            </div>
          </main>
        </div>
      }
    >
      <CampaignsContent />
    </Suspense>
  );
}
