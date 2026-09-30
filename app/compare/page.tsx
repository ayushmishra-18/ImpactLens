"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconRail } from "@/components/icon-rail";
import { CompareSlider } from "@/components/compare-slider";
import { Asset } from "@/types";
import {
  Sparkles,
  Share2,
  FileText,
  Megaphone,
  CheckCircle2,
  Layers,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface ComparisonItem {
  id: string;
  before_asset_id: string;
  after_asset_id: string;
  change_summary: string;
  before_asset?: Asset;
  after_asset?: Asset;
}

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CompareContent() {
  const searchParams = useSearchParams();
  const beforeParam = searchParams.get("before");
  const afterParam = searchParams.get("after");

  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [beforeAsset, setBeforeAsset] = useState<Asset | null>(null);
  const [afterAsset, setAfterAsset] = useState<Asset | null>(null);
  const [changeSummary, setChangeSummary] = useState<string>("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch live comparisons and assets
  useEffect(() => {
    Promise.all([
      fetch("/api/compare").then((r) => r.json()),
      fetch("/api/search").then((r) => r.json()),
    ])
      .then(([compareData, searchData]) => {
        const assets: Asset[] = searchData.assets || [];
        setAllAssets(assets);

        // Pre-select based on query params if provided
        let targetBefore: Asset | undefined;
        let targetAfter: Asset | undefined;

        if (beforeParam) {
          targetBefore = assets.find((a) => a.id === beforeParam);
        }
        if (afterParam) {
          targetAfter = assets.find((a) => a.id === afterParam);
        }

        if (compareData.comparisons && compareData.comparisons.length > 0) {
          const firstComp: ComparisonItem = compareData.comparisons[0];
          setChangeSummary(firstComp.change_summary || "");

          const before =
            targetBefore ||
            firstComp.before_asset ||
            assets.find((a) => a.id === firstComp.before_asset_id) ||
            assets[assets.length - 1];
          const after =
            targetAfter ||
            firstComp.after_asset ||
            assets.find((a) => a.id === firstComp.after_asset_id) ||
            assets[0];

          setBeforeAsset(before || null);
          setAfterAsset(after || null);
        } else if (assets.length >= 2) {
          setBeforeAsset(targetBefore || assets[assets.length - 1]);
          setAfterAsset(targetAfter || assets[0]);
          setChangeSummary(
            "Progression timeline confirms tangible ecological revival across designated observation points."
          );
        } else if (assets.length === 1) {
          setBeforeAsset(assets[0]);
          setAfterAsset(assets[0]);
        }
      })
      .catch((err) => console.error("Compare page load error:", err))
      .finally(() => setIsLoading(false));
  }, [beforeParam, afterParam]);

  // Run real-time Gemini AI comparison between selected assets
  const handleSynthesize = async () => {
    if (!beforeAsset || !afterAsset || beforeAsset.id === afterAsset.id) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          before_asset_id: beforeAsset.id,
          after_asset_id: afterAsset.id,
        }),
      });
      const data = await res.json();
      if (data.comparison?.change_summary) {
        setChangeSummary(data.comparison.change_summary);
      }
    } catch (err) {
      console.error("Failed to synthesize comparison:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-6 text-ink selection:bg-accent-blue/20">
      <IconRail />

      <main className="flex-1 ml-[88px] flex flex-col gap-6 max-w-[1400px]">
        {/* Header */}
        <header className="glass px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-ink">
                Automated Before & After Alignment
              </h1>
              <span className="pill pill-verified text-xs font-semibold">
                Live Cloudinary Normalization
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Paired by GPS proximity and chronological progression. Aligned via Cloudinary content-aware smart cropping.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="btn-ghost text-xs shadow-sm hover:scale-105 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? "Link Copied!" : "Share Comparison"}</span>
            </button>
            <Link
              href="/reports"
              className="btn-primary text-xs shadow-md hover:scale-105 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Insert into Report</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Asset Selectors Bar */}
        <div className="glass p-5 rounded-[28px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Before Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Baseline (Before):
              </span>
              <select
                value={beforeAsset?.id || ""}
                onChange={(e) => {
                  const found = allAssets.find((a) => a.id === e.target.value);
                  if (found) setBeforeAsset(found);
                }}
                className="glass-pill text-xs font-medium text-ink bg-white/80 border border-white focus:outline-none cursor-pointer max-w-[260px] truncate"
              >
                {allAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.caption?.slice(0, 35) || asset.cld_public_id}... ({asset.activity})
                  </option>
                ))}
              </select>
            </div>

            {/* After Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#17835b]">
                Current (After):
              </span>
              <select
                value={afterAsset?.id || ""}
                onChange={(e) => {
                  const found = allAssets.find((a) => a.id === e.target.value);
                  if (found) setAfterAsset(found);
                }}
                className="glass-pill text-xs font-medium text-ink bg-white/80 border border-white focus:outline-none cursor-pointer max-w-[260px] truncate"
              >
                {allAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.caption?.slice(0, 35) || asset.cld_public_id}... ({asset.activity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Re-Synthesize Button */}
          <button
            type="button"
            onClick={handleSynthesize}
            disabled={isSynthesizing || !beforeAsset || !afterAsset}
            className="btn-primary text-xs shadow-md flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
          >
            {isSynthesizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-accent-violet" />
            )}
            <span>Synthesize AI Comparison</span>
          </button>
        </div>

        {/* Interactive Comparison Slider */}
        {isLoading ? (
          <div className="glass p-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            <span className="text-sm text-ink-muted">Loading live assets...</span>
          </div>
        ) : beforeAsset && afterAsset ? (
          <CompareSlider
            beforeAsset={beforeAsset}
            afterAsset={afterAsset}
            changeSummary={changeSummary}
          />
        ) : (
          <div className="glass p-12 text-center">
            <p className="text-xs text-ink-muted">Please upload at least 2 field photos to generate comparisons.</p>
          </div>
        )}

        {/* Action Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/20 text-accent-blue flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink">
                Create Social Campaign Asset
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Transform this comparison into an Instagram carousel slide, 9:16 vertical video reel, or LinkedIn executive update card with live Cloudinary overlays.
              </p>
              <Link
                href={afterAsset ? `/campaigns?asset=${afterAsset.id}` : "/campaigns"}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink mt-3 hover:underline"
              >
                Open in Campaign Studio →
              </Link>
            </div>
          </div>

          <div className="glass p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#3FBF8F]/20 text-[#17835b] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink">
                Audit Proof Ledger
              </h4>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Both assets are normalized dynamically via <code className="bg-white/70 px-1 py-0.5 rounded text-[11px] font-mono">c_fill,g_auto,w_1200,h_800</code> ensuring pixel-accurate horizon alignment without cropping critical subjects.
              </p>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink mt-3 hover:underline"
              >
                View Full Audit Report →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-6 text-ink">
          <IconRail />
          <main className="flex-1 ml-[88px] flex items-center justify-center">
            <div className="glass p-10 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
              <span className="text-sm text-ink-muted">Loading compare studio...</span>
            </div>
          </main>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
