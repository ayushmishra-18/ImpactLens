"use client";

import { useState } from "react";
import { Image as ImageIcon, Video, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface MetaballStatProps {
  totalAssets: number;
  imagesCount: number;
  videosCount: number;
  verifiedCount: number;
}

export function MetaballStat({
  totalAssets = 48,
  imagesCount = 42,
  videosCount = 6,
  verifiedCount = 41,
}: MetaballStatProps) {
  const [filterMode, setFilterMode] = useState<"all" | "images" | "videos">("all");

  return (
    <div className="glass p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Total Field Evidence
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-light tracking-tight text-ink tabular-nums">
              {filterMode === "all"
                ? totalAssets
                : filterMode === "images"
                ? imagesCount
                : videosCount}
            </span>
            <span className="text-xs font-medium text-ink-muted">
              assets across 3 sites
            </span>
          </div>
        </div>

        {/* Toggle pill (Images / Videos) */}
        <div className="glass-tile p-1 flex items-center gap-1 rounded-full">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === "all"
                ? "bg-ink text-white font-medium shadow-sm"
                : "text-ink/70 hover:text-ink"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("images")}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === "images"
                ? "bg-ink text-white font-medium shadow-sm"
                : "text-ink/70 hover:text-ink"
            }`}
          >
            Images
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("videos")}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterMode === "videos"
                ? "bg-ink text-white font-medium shadow-sm"
                : "text-ink/70 hover:text-ink"
            }`}
          >
            Videos
          </button>
        </div>
      </div>

      {/* Center Liquid Metaball Bubbles Graphic */}
      <div className="py-6 flex items-center justify-center relative min-h-[140px]">
        {/* SVG Gooey Filter definition */}
        <svg className="hidden">
          <defs>
            <filter id="liquid-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>

        {/* The 3 Connected Liquid Bubbles */}
        <div
          className="flex items-center justify-center gap-3 relative filter-[url(#liquid-goo)] transition-all duration-500"
          style={{ filter: "drop-shadow(0 10px 25px rgba(123, 109, 242, 0.2))" }}
        >
          {/* Left Bubble: Images */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#9DB0EE] to-[#C6DCFF] flex flex-col items-center justify-center shadow-inner hover:scale-110 transition-transform duration-300 cursor-pointer">
            <ImageIcon className="w-5 h-5 text-ink/80 mb-0.5" />
            <span className="text-xs font-bold text-ink">{imagesCount}</span>
            <span className="text-[10px] text-ink-muted">Photos</span>
          </div>

          {/* Center Glowing Bubble: Videos (Violet, prominent as per design.md) */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7B6DF2] via-[#9A8CFF] to-[#5B5BEA] flex flex-col items-center justify-center shadow-lg text-white hover:scale-110 transition-transform duration-300 cursor-pointer z-10">
            <Video className="w-6 h-6 mb-0.5 animate-pulse" />
            <span className="text-sm font-extrabold">{videosCount}</span>
            <span className="text-[10px] text-white/80">Videos</span>
          </div>

          {/* Right Bubble: Verified */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#3FBF8F]/40 to-[#A9CDFF] flex flex-col items-center justify-center shadow-inner hover:scale-110 transition-transform duration-300 cursor-pointer">
            <ShieldCheck className="w-5 h-5 text-[#17835b] mb-0.5" />
            <span className="text-xs font-bold text-ink">{verifiedCount}</span>
            <span className="text-[10px] text-ink-muted">Verified</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/40 z-10">
        <span className="text-xs text-ink-muted">
          Auto-synchronized with Cloudinary bucket
        </span>
        <Link
          href="/library"
          className="text-xs font-semibold text-ink flex items-center gap-1 hover:underline"
        >
          Browse Evidence <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
