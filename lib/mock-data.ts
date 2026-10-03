import { Project, Site, Asset, Comparison, Report } from "@/types";

export const DEMO_PROJECT: Project = {
  id: "proj-sustainability-01",
  name: "Field Sustainability & Ecological Impact",
  description:
    "Independent ecological monitoring, afforestation, waste extraction, and verifiable sustainability reporting.",
  category: "sustainability",
  start_date: "2026-06-01",
  end_date: "2026-10-31",
  cloudinary_folder: "impactlens/field-vault",
  created_at: "2026-06-01T08:00:00Z",
};

export const DEMO_SITES: Site[] = [
  {
    id: "site-north-zone",
    project_id: DEMO_PROJECT.id,
    name: "Zone Alpha — Forest & Flora Conservation",
    latitude: 19.0760,
    longitude: 72.8777,
    radius_m: 350,
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    id: "site-central-bend",
    project_id: DEMO_PROJECT.id,
    name: "Zone Beta — Waste Diversion & Soil Remediation",
    latitude: 19.0680,
    longitude: 72.8690,
    radius_m: 200,
    created_at: "2026-06-05T09:30:00Z",
  },
  {
    id: "site-community-nursery",
    project_id: DEMO_PROJECT.id,
    name: "Zone Gamma — Community Nursery & Water Basin",
    latitude: 19.0430,
    longitude: 72.8420,
    radius_m: 150,
    created_at: "2026-06-10T10:15:00Z",
  },
];

export const DEMO_ASSETS: Asset[] = [];

export const DEMO_COMPARISONS: Comparison[] = [];

export const DEMO_METRICS = {
  totalAssets: 48,
  totalImages: 42,
  totalVideos: 6,
  verifiedAssets: 41,
  verificationHealth: 95,
  plantedSaplings: 3200,
  wasteDivertedKg: 1850,
  volunteerHours: 420,
  sitesCount: 3,
  monthlyEvidence: [
    { month: "May", count: 8, verified: 6 },
    { month: "Jun", count: 18, verified: 15 },
    { month: "Jul", count: 29, verified: 26 },
    { month: "Aug", count: 38, verified: 34 },
    { month: "Sep", count: 48, verified: 41, active: true },
  ],
  healthHistory: [
    { day: "Jun 01", health: 62 },
    { day: "Jun 20", health: 68 },
    { day: "Jul 10", health: 74 },
    { day: "Aug 01", health: 79 },
    { day: "Aug 25", health: 81 },
    { day: "Sep 15", health: 83 },
    { day: "Sep 30", health: 85 },
  ],
};

export const DEMO_REPORT: Report = {
  id: "rep-audit-q3-2026",
  project_id: DEMO_PROJECT.id,
  title: "Verified Field Sustainability & Impact Audit",
  date_from: "2026-06-01",
  date_to: "2026-09-30",
  share_token: "rep_audit_shared",
  executive_summary:
    "Over 120 days of intervention across designated monitoring zones, ImpactLens processed and verified field media assets with cryptographic integrity and physical provenance. Grounded AI evidence confirms ongoing vegetation restoration, active community stewardship, and verified waste diversion.",
  metrics: DEMO_METRICS,
  created_at: "2026-09-30T10:00:00Z",
};
