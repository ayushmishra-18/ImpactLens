"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  UploadCloud,
  SplitSquareVertical,
  FileText,
  Megaphone,
  Settings,
  Bell,
  HelpCircle,
  Leaf,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Library", href: "/library", icon: Images },
  { name: "Upload", href: "/upload", icon: UploadCloud },
  { name: "Compare", href: "/compare", icon: SplitSquareVertical },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
];

export function IconRail() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <aside className="w-[72px] h-[calc(100vh-32px)] my-4 ml-4 flex flex-col items-center justify-between py-6 glass z-30 fixed top-0 left-0">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/"
          className="w-11 h-11 rounded-2xl bg-ink flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
          title="ImpactLens"
        >
          <Leaf className="w-5 h-5 text-accent-sky" />
        </Link>

        {/* Primary Navigation */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-white text-ink shadow-md font-semibold scale-105"
                    : "text-ink/60 hover:text-ink hover:bg-white/40"
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utilities */}
      <div className="flex flex-col items-center gap-3 relative">
        {/* Notifications Popover */}
        {showNotifications && (
          <div className="absolute left-[78px] bottom-16 w-80 glass p-4 rounded-2xl shadow-2xl border border-white z-50 text-xs flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-white/50">
              <span className="font-bold text-ink">System Notifications</span>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-ink-muted hover:text-ink text-[11px]"
              >
                Dismiss
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-white/70 rounded-xl border border-white flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3FBF8F] mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-ink">Dedicated Database Active</p>
                  <p className="text-[11px] text-ink-muted">Project wrykqeuxindjluhnldsv connected with pgvector.</p>
                </div>
              </div>
              <div className="p-2 bg-white/70 rounded-xl border border-white flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-blue mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-ink">Gemini 2.5 Flash Lite Vision</p>
                  <p className="text-[11px] text-ink-muted">Automatic EXIF, GPS & object grounding enabled.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help & Guide Popover */}
        {showHelp && (
          <div className="absolute left-[78px] bottom-8 w-88 glass p-5 rounded-2xl shadow-2xl border border-white z-50 text-xs flex flex-col gap-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-white/50">
              <span className="font-bold text-ink text-sm">ImpactLens Guide</span>
              <button
                onClick={() => setShowHelp(false)}
                className="text-ink-muted hover:text-ink text-[11px]"
              >
                Close
              </button>
            </div>
            <p className="text-ink-muted leading-relaxed">
              Transform raw field photos & videos into verified, tamper-evident impact proof for donors and auditors.
            </p>
            <div className="space-y-1.5 text-[11px] text-ink">
              <div className="p-1.5 bg-white/60 rounded-lg">1. <b>Upload:</b> Direct signed upload with client EXIF & GPS detection</div>
              <div className="p-1.5 bg-white/60 rounded-lg">2. <b>AI Vision:</b> Gemini counts saplings, debris & classifies groundcover</div>
              <div className="p-1.5 bg-white/60 rounded-lg">3. <b>Search:</b> 768-d pgvector semantic search</div>
              <div className="p-1.5 bg-white/60 rounded-lg">4. <b>Deliver:</b> Dynamic before/after sliders, reports & campaign cards</div>
            </div>
          </div>
        )}

        <button
          type="button"
          title="Notifications"
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowHelp(false);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${
            showNotifications ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink hover:bg-white/40"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-blue" />
        </button>
        <button
          type="button"
          title="Support & Quick Guide"
          onClick={() => {
            setShowHelp(!showHelp);
            setShowNotifications(false);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            showHelp ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink hover:bg-white/40"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <Link
          href="/settings"
          title="Settings & System Status"
          className="w-10 h-10 rounded-full flex items-center justify-center text-ink/60 hover:text-ink hover:bg-white/40 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-full bg-accent-blue/30 border border-white/60 flex items-center justify-center text-xs font-semibold text-ink mt-2 cursor-pointer shadow-sm hover:scale-105 transition-transform"
          title="Field Lead Profile & Settings"
        >
          AM
        </Link>
      </div>
    </aside>
  );
}
