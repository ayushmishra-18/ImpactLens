"use client";

import { useState } from "react";
import { RotateCw, CheckCircle2, ShieldCheck, MapPin, Clock, CopyX } from "lucide-react";

interface HeroHealthCardProps {
  score?: number;
  history?: { day: string; health: number }[];
}

export function HeroHealthCard({
  score = 85,
  history = [
    { day: "Jun 01", health: 62 },
    { day: "Jun 20", health: 68 },
    { day: "Jul 10", health: 74 },
    { day: "Aug 01", health: 79 },
    { day: "Aug 25", health: 81 },
    { day: "Sep 15", health: 83 },
    { day: "Sep 30", health: 85 },
  ],
}: HeroHealthCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentScore, setCurrentScore] = useState(score);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setCurrentScore(86);
    }, 900);
  };

  // Generate SVG path for the smooth line chart
  const width = 280;
  const height = 75;
  const minVal = 55;
  const maxVal = 95;

  const points = history.map((pt, i) => {
    const x = (i / (history.length - 1)) * (width - 24) + 12;
    const y = height - ((pt.health - minVal) / (maxVal - minVal)) * (height - 20) - 10;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1},${prev.y} ${cpX2},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const lastPoint = points[points.length - 1];

  return (
    <div className="hero-gradient-card p-6 flex flex-col justify-between relative overflow-hidden text-white shadow-2xl">
      {/* Background ambient glow shapes */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-blue/30 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/85">
              Verification Health
            </span>
            <span className="bg-white/25 text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
              Audit-Ready
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-light tracking-tight tabular-nums">
              {currentScore}%
            </span>
            <span className="text-xs text-white/80 font-medium">
              cryptographic trust score
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          title="Re-run verification checks"
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <RotateCw className={`w-4 h-4 text-white ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Center Smooth Trend Line Chart with glowing endpoint dot */}
      <div className="my-3 relative z-10 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-20 overflow-visible"
        >
          {/* Subtle area gradient */}
          <defs>
            <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x1="-20%" y1="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area under curve */}
          <path
            d={`${pathD} L ${lastPoint.x},${height} L ${points[0].x},${height} Z`}
            fill="url(#lineFill)"
          />

          {/* Main White Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Glowing End Dot */}
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="7"
            fill="#ffffff"
            filter="url(#glow)"
          />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="4"
            fill="#5B7CFA"
          />
        </svg>
      </div>

      {/* Trust Checklist Footer */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/25 z-10 text-xs">
        <div className="flex items-center gap-1.5 text-white/90">
          <MapPin className="w-3.5 h-3.5 text-white" />
          <span>GPS EXIF (96%)</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/90">
          <Clock className="w-3.5 h-3.5 text-white" />
          <span>Timestamped</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/90">
          <CopyX className="w-3.5 h-3.5 text-white" />
          <span>0 Duplicates</span>
        </div>
      </div>
    </div>
  );
}
