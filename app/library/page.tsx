"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconRail } from "@/components/icon-rail";
import { MediaTile } from "@/components/media-tile";
import { AssetDetailDrawer } from "@/components/asset-detail-drawer";
import { Asset } from "@/types";
import {
  Search,
  Sparkles,
  MapPin,
  UploadCloud,
  Loader2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

const activities = [
  { id: "all", label: "All Activities" },
  { id: "tree_planting", label: "Tree Planting" },
  { id: "cleanup", label: "Waste Cleanup" },
  { id: "site_assessment", label: "Site Assessment" },
  { id: "nursery_propagation", label: "Nursery Prep" },
  { id: "water_testing", label: "Water Testing" },
];

interface Site {
  id: string;
  name: string;
}

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("all");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Dynamic sites & assets from Supabase
  const [sites, setSites] = useState<Site[]>([]);
  const [dbAssets, setDbAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"loading" | "database" | "semantic_vector" | "empty">("loading");

  // Fetch sites dynamically
  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => {
        if (data.sites) setSites(data.sites);
      })
      .catch((err) => console.error("Failed to load sites:", err));
  }, []);

  // Fetch assets dynamically from the search endpoint
  const fetchAssets = useCallback(async (query: string, activity: string, siteId: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (activity !== "all") params.set("activity", activity);
      if (siteId !== "all") params.set("site_id", siteId);
      params.set("mode", "hybrid");

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (data.assets && data.assets.length > 0) {
        setDbAssets(data.assets);
        setDataSource(data.source === "semantic_vector" ? "semantic_vector" : "database");
      } else {
        setDbAssets([]);
        setDataSource("empty");
      }
    } catch (err) {
      console.error("Library fetch error:", err);
      setDbAssets([]);
      setDataSource("empty");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search + filter refetch (handles initial load and updates cleanly)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets(searchQuery, selectedActivity, selectedSite);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedActivity, selectedSite, fetchAssets]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#9DB0EE] via-[#BACAEF] to-[#D3DEEA] p-4 md:p-6 text-ink selection:bg-accent-blue/20">
      <IconRail />

      <main className="flex-1 ml-[88px] flex flex-col gap-6 max-w-[1600px]">
        {/* Top Header */}
        <header className="glass px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-ink">
                Evidence Library & Semantic Discovery
              </h1>
              {dataSource === "semantic_vector" && (
                <span className="pill bg-[#7B6DF2]/15 text-[#7B6DF2] border border-[#7B6DF2]/30 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  pgvector Semantic Match ({dbAssets.length})
                </span>
              )}
              {dataSource === "database" && (
                <span className="pill pill-verified text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3FBF8F]" />
                  Live Supabase DB ({dbAssets.length} Assets)
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Immutable visual evidence vault powered by Cloudinary zero-overwrite masters and Gemini pgvector embeddings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchAssets(searchQuery, selectedActivity, selectedSite)}
              className="btn-ghost text-xs shadow-sm"
              title="Refresh from Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/upload"
              className="btn-primary text-xs shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Media</span>
            </Link>
          </div>
        </header>

        {/* Search & Prompt Bar */}
        <div className="glass p-4 rounded-[28px] flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across verified visual evidence (e.g. 'mangrove saplings', 'plastic garbage cleanup', 'student volunteers')..."
              className="w-full bg-white/70 border border-white/80 rounded-full pl-11 pr-24 py-3 text-xs md:text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/40 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Natural Language Prompts */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-ink-muted px-2">
            <span className="flex items-center gap-1 font-semibold text-ink">
              <Sparkles className="w-3.5 h-3.5 text-accent-violet" />
              Try Vector Search:
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("mangrove saplings")}
              className="hover:text-ink underline text-[11px]"
            >
              &quot;mangrove saplings&quot;
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setSearchQuery("people planting trees")}
              className="hover:text-ink underline text-[11px]"
            >
              &quot;people planting trees&quot;
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setSearchQuery("plastic garbage cleanup")}
              className="hover:text-ink underline text-[11px]"
            >
              &quot;plastic garbage cleanup&quot;
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setSearchQuery("degraded riverbank erosion")}
              className="hover:text-ink underline text-[11px]"
            >
              &quot;degraded riverbank erosion&quot;
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Activity Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {activities.map((act) => {
              const isSelected = selectedActivity === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setSelectedActivity(act.id)}
                  className={`pill text-xs transition-all ${
                    isSelected
                      ? "bg-ink text-white font-semibold shadow-sm scale-105"
                      : "pill-done hover:bg-white/80 cursor-pointer"
                  }`}
                >
                  {act.label}
                </button>
              );
            })}
          </div>

          {/* Site Selector Pill */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent-blue" />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="glass-pill text-xs font-medium text-ink bg-white/70 border border-white/80 cursor-pointer focus:outline-none"
            >
              <option value="all">All Monitoring Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-accent-blue mr-2" />
            <span className="text-sm text-ink-muted">Searching evidence library...</span>
          </div>
        )}

        {/* Media Grid */}
        {!isLoading && dbAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {dbAssets.map((asset) => (
              <MediaTile
                key={asset.id}
                asset={asset}
                onClick={() => setSelectedAsset(asset)}
              />
            ))}
          </div>
        ) : !isLoading ? (
          <div className="glass p-12 text-center flex flex-col items-center justify-center gap-3 min-h-[300px]">
            <FolderOpen className="w-10 h-10 text-ink-muted/50" />
            <h3 className="text-base font-semibold text-ink">No Visual Evidence Found</h3>
            <p className="text-xs text-ink-muted max-w-sm">
              {searchQuery
                ? `No evidence matched "${searchQuery}". Try a broader term or reset your search.`
                : "No assets found for the selected activity or site."}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="btn-ghost text-xs"
                >
                  Reset Query
                </button>
              )}
              <Link href="/upload" className="btn-primary text-xs">
                Upload New Media
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      {/* Asset Detail Drawer */}
      <AssetDetailDrawer
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
}
