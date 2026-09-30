"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  FileText,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

import { Asset } from "@/types";

interface ActivityItem {
  id: string;
  type: "upload" | "enrichment" | "report" | "attention";
  title: string;
  timestamp: string;
  siteName: string;
  status: "processing" | "ready" | "needs_review";
}

interface ActivityFeedProps {
  assets?: Asset[];
  totalVerified?: number;
  activeSitesCount?: number;
}

function getRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Recently";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function ActivityFeed({
  assets = [],
  totalVerified = 0,
  activeSitesCount = 3,
}: ActivityFeedProps) {
  const dynamicActivities: ActivityItem[] =
    assets.length > 0
      ? assets.slice(0, 5).map((a, i) => ({
          id: a.id || `act-${i}`,
          type: (a.caption ? "enrichment" : "upload") as ActivityItem["type"],
          title: a.caption || `Uploaded ${a.cld_public_id.split("/").pop()}`,
          timestamp: getRelativeTime(a.created_at),
          siteName: a.site?.name || "Mithi River Basin",
          status: (a.status === "ready" ? "ready" : "processing") as ActivityItem["status"],
        }))
      : [];
  return (
    <div className="flex flex-col gap-5">
      {/* Donor Story Callout Prompt */}
      <div className="glass p-5 relative overflow-hidden bg-gradient-to-br from-white/60 to-white/30 border border-white/80 shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#7B6DF2]/20 text-[#7B6DF2] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink">
              Turn evidence into a donor story
            </h4>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              You have {totalVerified > 0 ? totalVerified : assets.length} verified assets across {activeSitesCount} sites ready for automated impact reporting and social cards.
            </p>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink mt-3 hover:underline group"
            >
              Generate Impact Report
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Activity Feed */}
      <div className="glass p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
              Live Updates
            </span>
            <h3 className="text-base font-semibold text-ink">Activity Feed</h3>
          </div>
          <Link
            href="/library"
            className="text-xs font-medium text-ink-muted hover:text-ink flex items-center gap-1"
          >
            View all <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-white/40">
          {dynamicActivities.length === 0 ? (
            <div className="py-6 text-center text-xs text-ink-muted">
              No recent activity recorded yet.
            </div>
          ) : (
            dynamicActivities.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === "attention"
                      ? "bg-warn/20 text-[#b86e08]"
                      : item.type === "report"
                      ? "bg-accent-violet/20 text-accent-violet"
                      : "bg-white/80 text-ink"
                  }`}
                >
                  {item.type === "attention" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : item.type === "report" ? (
                    <FileText className="w-4 h-4" />
                  ) : item.type === "upload" ? (
                    <UploadCloud className="w-4 h-4" />
                  ) : (
                    <FileCheck2 className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                    <span>{item.siteName}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="shrink-0">
                {item.status === "processing" ? (
                  <span className="pill pill-pending text-[10px]">Processing</span>
                ) : item.status === "needs_review" ? (
                  <span className="pill pill-warning text-[10px]">Review</span>
                ) : (
                  <span className="pill pill-verified text-[10px]">Ready</span>
                )}
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
