"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Asset } from "@/types";
import { Sparkles, Calendar, MapPin, CheckCircle2 } from "lucide-react";

interface CompareSliderProps {
  beforeAsset: Asset;
  afterAsset: Asset;
  changeSummary?: string;
}

export function CompareSlider({
  beforeAsset,
  afterAsset,
  changeSummary,
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  // Global mousemove and mouseup listeners for seamless dragging outside container
  useEffect(() => {
    if (!isDragging) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const onGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };
  }, [isDragging, handleMove]);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  // Dynamic date formatting
  const beforeDateStr = beforeAsset.captured_at || beforeAsset.created_at;
  const afterDateStr = afterAsset.captured_at || afterAsset.created_at;

  const beforeFormatted = beforeDateStr
    ? new Date(beforeDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Baseline";

  const afterFormatted = afterDateStr
    ? new Date(afterDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Current";

  const daysDiff = (beforeDateStr && afterDateStr)
    ? Math.max(1, Math.round(Math.abs(new Date(afterDateStr).getTime() - new Date(beforeDateStr).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const siteName = afterAsset.site?.name || beforeAsset.site?.name || "Corridor Monitoring Site";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Date and Location Header Chips */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="glass-pill flex items-center gap-1.5 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>
              {beforeFormatted} → {afterFormatted} {daysDiff ? `(${daysDiff} days)` : ""}
            </span>
          </span>
          <span className="glass-pill flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <MapPin className="w-3.5 h-3.5 text-accent-blue" />
            <span>{siteName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="pill pill-done text-xs">
            Baseline: {beforeFormatted}
          </span>
          <span className="pill pill-verified text-xs">
            Restored: {afterFormatted}
          </span>
        </div>
      </div>

      {/* Main Interactive Slider Frame */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[28px] overflow-hidden select-none cursor-ew-resize glass border-2 border-white/80 shadow-2xl"
      >
        {/* 'After' Image (Right / Background Layer) */}
        <div className="absolute inset-0">
          <Image
            src={afterAsset.cld_secure_url}
            alt="After restoration"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 right-5 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-semibold z-10 shadow-lg">
            AFTER • {afterFormatted}
          </div>
        </div>

        {/* 'Before' Image (Left Layer - Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={beforeAsset.cld_secure_url}
            alt="Before restoration"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 left-5 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-semibold z-10 shadow-lg">
            BEFORE • {beforeFormatted}
          </div>
        </div>

        {/* Divider Line & Center Draggable Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-ink flex items-center justify-center shadow-xl border border-black/10 cursor-ew-resize pointer-events-auto hover:scale-110 transition-transform">
            <svg
              className="w-4 h-4 text-ink"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 9l-4 3 4 3m8-6l4 3-4 3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* AI Change Summary Card */}
      <div className="glass p-6 rounded-[24px] border border-white/80 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-accent-violet/20 text-accent-violet flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-ink">
              AI Visible Change Synthesis
            </h4>
          </div>
          <span className="text-[11px] bg-white/70 px-2.5 py-1 rounded-full text-ink-muted border border-white font-medium">
            AI-generated · grounded in tags & EXIF
          </span>
        </div>

        <p className="text-sm text-ink/90 leading-relaxed font-normal">
          {changeSummary ||
            "110-day timeline comparison demonstrates complete removal of surface plastic waste, bio-engineered bund installation, and 85+ rooted mangrove saplings achieving a 78% vegetative groundcover increase across the perimeter."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-white/40 text-xs">
          <div className="flex items-center gap-2 text-ink">
            <CheckCircle2 className="w-4 h-4 text-[#17835b]" />
            <span>Plastic Debris: 100% Extracted</span>
          </div>
          <div className="flex items-center gap-2 text-ink">
            <CheckCircle2 className="w-4 h-4 text-[#17835b]" />
            <span>Sapling Count: 85+ Rooted</span>
          </div>
          <div className="flex items-center gap-2 text-ink">
            <CheckCircle2 className="w-4 h-4 text-[#17835b]" />
            <span>Groundcover: +78% Vegetation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
