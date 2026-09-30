"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SplitSquareVertical, ArrowRight } from "lucide-react";
import { Asset } from "@/types";

interface QuickCompareProps {
  beforeAsset?: Asset;
  afterAsset?: Asset;
  siteName?: string;
}

export function QuickCompare({
  beforeAsset: initialBefore,
  afterAsset: initialAfter,
  siteName = "North Basin",
}: QuickCompareProps) {
  const [before, setBefore] = useState<Asset | null>(initialBefore || null);
  const [after, setAfter] = useState<Asset | null>(initialAfter || null);

  useEffect(() => {
    if (initialBefore && initialAfter) {
      setBefore(initialBefore);
      setAfter(initialAfter);
      return;
    }

    // Fetch live comparison from API
    fetch("/api/compare")
      .then((r) => r.json())
      .then((data) => {
        if (data.comparisons && data.comparisons.length > 0) {
          const comp = data.comparisons[0];
          if (comp.before_asset) setBefore(comp.before_asset);
          if (comp.after_asset) setAfter(comp.after_asset);
        }
      })
      .catch((err) => console.error("QuickCompare fetch error:", err));
  }, [initialBefore, initialAfter]);

  if (!before || !after) {
    return (
      <div className="glass p-6 flex flex-col justify-between min-h-[260px]">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Direct Comparison
          </span>
          <h3 className="text-base font-semibold text-ink mt-1">Quick Before / After</h3>
          <p className="text-xs text-ink-muted mt-2 leading-relaxed">
            Upload two or more field assets to inspect AI-powered visible change detection.
          </p>
        </div>
        <Link href="/upload" className="btn-secondary w-full text-center mt-4">
          <span>Upload Media</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Direct Comparison
          </span>
          <span className="text-xs text-ink font-medium">{siteName}</span>
        </div>
        <h3 className="text-base font-semibold text-ink">
          Quick Before / After
        </h3>
        <p className="text-xs text-ink-muted mt-1 leading-relaxed">
          Select site baseline & current checkpoint to inspect AI visible change detection.
        </p>
      </div>

      {/* Avatars / Thumbnail Picker */}
      <div className="my-4 flex items-center justify-between gap-3">
        {/* Before Asset Avatar */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Baseline
          </span>
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-black/5">
            <Image
              src={before.cld_secure_url}
              alt={before.caption || "Before"}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <span className="text-[11px] text-ink-muted truncate max-w-[80px]">
            {before.activity?.replace(/_/g, " ") || "Baseline"}
          </span>
        </div>

        {/* Transition Icon */}
        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-ink shrink-0 shadow-sm mt-3">
          <SplitSquareVertical className="w-4 h-4 text-accent-violet" />
        </div>

        {/* After Asset Avatar */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Current
          </span>
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#3FBF8F] shadow-md ring-2 ring-[#3FBF8F]/30 bg-black/5">
            <Image
              src={after.cld_secure_url}
              alt={after.caption || "After"}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <span className="text-[11px] text-ink font-medium truncate max-w-[80px]">
            {after.activity?.replace(/_/g, " ") || "Current"}
          </span>
        </div>
      </div>

      {/* Compare Action Button */}
      <Link
        href={`/compare?before=${before.id}&after=${after.id}`}
        className="btn-primary w-full text-center mt-2 group"
      >
        <span>Open Compare Slider</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
