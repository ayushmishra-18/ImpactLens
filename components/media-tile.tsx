"use client";

import Image from "next/image";
import { Asset } from "@/types";
import { ShieldCheck, Video, MapPin, Sparkles } from "lucide-react";

interface MediaTileProps {
  asset: Asset;
  onClick?: () => void;
}

export function MediaTile({ asset, onClick }: MediaTileProps) {
  return (
    <div
      onClick={onClick}
      className="glass group relative overflow-hidden rounded-[20px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-white/60"
    >
      {/* Media Image / Video Poster */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
        <Image
          src={asset.cld_secure_url}
          alt={asset.caption || asset.original_filename || "Field Evidence"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top-right Status Pill */}
        <div className="absolute top-3 right-3 z-10">
          {asset.status === "ready" ? (
            <span className="pill pill-verified text-[11px] shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-[#17835b]" />
              Ready
            </span>
          ) : asset.status === "processing" ? (
            <span className="pill pill-pending text-[11px] shadow-sm backdrop-blur-md">
              Processing
            </span>
          ) : (
            <span className="pill pill-warning text-[11px] shadow-sm backdrop-blur-md">
              Review
            </span>
          )}
        </div>

        {/* Video Duration Badge */}
        {asset.cld_resource_type === "video" && (
          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
            <Video className="w-3 h-3 text-accent-sky" />
            <span>{asset.duration_sec ? `${Math.round(asset.duration_sec)}s` : "Video"}</span>
          </div>
        )}

        {/* Gradient shadow for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Bottom Glass Strip (Tags + Verification Dot + Caption) */}
      <div className="p-4 bg-white/55 backdrop-blur-md border-t border-white/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink truncate capitalize">
            {asset.activity?.replace("_", " ") || "Field Evidence"}
          </span>
          {asset.verification_score && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#17835b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3FBF8F] animate-pulse" />
              <span>{Math.round(asset.verification_score * 100)}%</span>
            </div>
          )}
        </div>

        <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
          {asset.caption}
        </p>

        {/* Tags row */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-hidden flex-wrap pt-1">
            {asset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-white/70 text-ink/75 px-2 py-0.5 rounded-md border border-white/80"
              >
                #{tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="text-[10px] text-ink-muted">
                +{asset.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* GPS location badge */}
        {asset.gps_lat && asset.gps_lng && (
          <div className="flex items-center gap-1 text-[10px] text-ink-muted pt-0.5">
            <MapPin className="w-3 h-3 text-accent-blue" />
            <span>
              {asset.gps_lat.toFixed(4)}° N, {asset.gps_lng.toFixed(4)}° E
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
