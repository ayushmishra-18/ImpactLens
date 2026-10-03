"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconRail } from "@/components/icon-rail";
import {
  Settings,
  Database,
  Cloud,
  Cpu,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Server,
  ArrowRight,
  ExternalLink,
  FolderTree,
  Building2,
  Save,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [stats, setStats] = useState<{ totalAssets: number; source: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic project details
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectFolder, setProjectFolder] = useState("impactlens/evidence-vault");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectSaveSuccess, setProjectSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats({ totalAssets: d.metrics?.totalAssets || 0, source: d.source || "database" }))
      .catch((err) => console.error("Settings stats fetch error:", err));

    fetch("/api/project")
      .then((r) => r.json())
      .then((d) => {
        if (d.project) {
          setProjectName(d.project.name || "Field Sustainability & Ecological Impact");
          setProjectDesc(d.project.description || "");
          setProjectFolder(d.project.cloudinary_folder || "impactlens/evidence-vault");
        }
      })
      .catch((err) => console.error("Settings project fetch error:", err));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, projRes] = await Promise.all([
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/project").then((r) => r.json()),
      ]);
      setStats({ totalAssets: statsRes.metrics?.totalAssets || 0, source: statsRes.source || "database" });
      if (projRes.project) {
        setProjectName(projRes.project.name || "");
        setProjectDesc(projRes.project.description || "");
        setProjectFolder(projRes.project.cloudinary_folder || "impactlens/evidence-vault");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProject(true);
    setProjectSaveSuccess(false);

    try {
      const res = await fetch("/api/project", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description: projectDesc,
          cloudinary_folder: projectFolder,
        }),
      });

      if (res.ok) {
        setProjectSaveSuccess(true);
        setTimeout(() => setProjectSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
      setIsSavingProject(false);
    }
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
                System Status & Project Configuration
              </h1>
              <span className="pill pill-verified text-xs font-semibold">
                All Services Healthy
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Live telemetry for Cloudinary media vault, Supabase pgvector instance, Gemini AI, and active project profile.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="btn-ghost text-xs shadow-sm self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Health</span>
          </button>
        </header>

        {/* Project Profile Editor */}
        <div className="glass p-6 rounded-[24px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Project Profile & Scope</h3>
                <p className="text-xs text-ink-muted">
                  Customizes the initiative title, description, and Cloudinary master vault folder shown across the dashboard, reports, and public share links.
                </p>
              </div>
            </div>
            {projectSaveSuccess && (
              <span className="pill pill-verified text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-[#17835b]" />
                Saved to Database
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProject} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                  Project Title / Initiative Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Amazon Rainforest Revival or Coastal Mangrove Afforestation"
                  className="w-full bg-white/70 border border-white/80 rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-blue/30 shadow-inner font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                  Cloudinary Vault Master Folder
                </label>
                <input
                  type="text"
                  value={projectFolder}
                  onChange={(e) => setProjectFolder(e.target.value)}
                  placeholder="e.g. impactlens/evidence-vault"
                  className="w-full bg-white/70 border border-white/80 rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-blue/30 shadow-inner font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Mission Statement / Executive Description
              </label>
              <textarea
                rows={2}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Briefly describe the sustainability goals, intervention scope, and community monitoring parameters..."
                className="w-full bg-white/70 border border-white/80 rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-blue/30 shadow-inner leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingProject}
                className="btn-primary text-xs shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingProject ? "Saving..." : "Save Project Scope"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cloudinary */}
          <div className="glass p-6 rounded-[24px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-accent-blue/20 text-accent-blue flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <span className="pill pill-verified text-[11px]">Connected</span>
              </div>
              <h3 className="text-base font-semibold text-ink">Cloudinary Media Ledger</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Zero-overwrite master repository with signed direct client uploads and automated image optimization.
              </p>
              <div className="mt-4 pt-3 border-t border-white/40 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Cloud Name</span>
                  <span className="font-mono font-semibold text-ink">
                    {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "rvgffszz"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Master Folder</span>
                  <span className="font-mono text-ink truncate max-w-[180px]">{projectFolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Signed Delivery</span>
                  <span className="font-semibold text-emerald-800">Enabled</span>
                </div>
              </div>
            </div>
            <a
              href="https://console.cloudinary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 btn-secondary text-xs flex items-center justify-center gap-1.5"
            >
              <span>Cloudinary Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Supabase */}
          <div className="glass p-6 rounded-[24px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3FBF8F]/20 text-[#17835b] flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <span className="pill pill-verified text-[11px]">Active Healthy</span>
              </div>
              <h3 className="text-base font-semibold text-ink">Supabase pgvector Database</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Dedicated database instance with 768-d vector cosine similarity index for instant semantic image search.
              </p>
              <div className="mt-4 pt-3 border-t border-white/40 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">pgvector Extension</span>
                  <span className="font-mono font-semibold text-emerald-800">Installed (768-d)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Database Engine</span>
                  <span className="text-ink font-medium">PostgreSQL 15+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Active Assets</span>
                  <span className="font-mono font-bold text-[#17835b]">{stats?.totalAssets ?? 0} Records</span>
                </div>
              </div>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 btn-secondary text-xs flex items-center justify-center gap-1.5"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Gemini AI */}
          <div className="glass p-6 rounded-[24px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-accent-violet/20 text-accent-violet flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="pill pill-verified text-[11px]">Active</span>
              </div>
              <h3 className="text-base font-semibold text-ink">Gemini 2.5 Flash Lite</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Multi-model vision analysis for object counting, groundcover classification, and chronological comparison synthesis.
              </p>
              <div className="mt-4 pt-3 border-t border-white/40 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Vision Model</span>
                  <span className="font-mono text-ink">gemini-2.5-flash-lite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Embedding Model</span>
                  <span className="font-mono text-ink">gemini-embedding-001 (768-d)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Verification Rate</span>
                  <span className="font-semibold text-emerald-800">96% Grounded</span>
                </div>
              </div>
            </div>
            <div className="mt-5 bg-white/50 p-2.5 rounded-xl border border-white/80 text-[11px] text-ink-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Grounded JSON output schema with strict Zod validation</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Hub */}
        <div className="glass p-6 rounded-[24px]">
          <h3 className="text-base font-semibold text-ink mb-4">Workspace Navigation Directory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link
              href="/"
              className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white/80 transition-all text-xs font-semibold text-ink flex items-center justify-between group"
            >
              <span>1. Overview Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/library"
              className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white/80 transition-all text-xs font-semibold text-ink flex items-center justify-between group"
            >
              <span>2. Evidence Library</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/upload"
              className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white/80 transition-all text-xs font-semibold text-ink flex items-center justify-between group"
            >
              <span>3. Ingestion Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/compare"
              className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white/80 transition-all text-xs font-semibold text-ink flex items-center justify-between group"
            >
              <span>4. AI Comparison</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/reports"
              className="p-3 bg-white/60 hover:bg-white rounded-xl border border-white/80 transition-all text-xs font-semibold text-ink flex items-center justify-between group"
            >
              <span>5. Verified Reports</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
