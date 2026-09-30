import { Project, Site, Asset, Comparison, Report } from "@/types";

export const DEMO_PROJECT: Project = {
  id: "proj-mumbai-riverbank-01",
  name: "Riverbank Restoration — Mumbai",
  description:
    "Community-led ecological restoration and mangrove revival along the Mithi River corridor in Mumbai. Measuring afforestation, waste extraction, and biodiversity recovery.",
  category: "reforestation",
  start_date: "2026-06-01",
  end_date: "2026-10-31",
  cloudinary_folder: "impactlens/mumbai-riverbank",
  created_at: "2026-06-01T08:00:00Z",
};

export const DEMO_SITES: Site[] = [
  {
    id: "site-north-zone",
    project_id: DEMO_PROJECT.id,
    name: "North Basin & Mangrove Belt",
    latitude: 19.0760,
    longitude: 72.8777,
    radius_m: 350,
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    id: "site-central-bend",
    project_id: DEMO_PROJECT.id,
    name: "Central Bend Waste Diversion",
    latitude: 19.0680,
    longitude: 72.8690,
    radius_m: 200,
    created_at: "2026-06-05T09:30:00Z",
  },
  {
    id: "site-community-nursery",
    project_id: DEMO_PROJECT.id,
    name: "Mahim Community Nursery",
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
  verificationHealth: 85, // 85%
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
  id: "rep-mumbai-q3-2026",
  project_id: DEMO_PROJECT.id,
  title: "Q3 2026 Ecological Restoration & Verification Report",
  date_from: "2026-06-01",
  date_to: "2026-09-30",
  share_token: "rep_mumbai_q3_shared",
  executive_summary:
    "Over 120 days of intervention across 3 designated sites on the Mithi River corridor, ImpactLens processed and verified 48 field media assets with an overall 85% cryptographic and provenance health rating. Visible evidence confirms the diversion of 1,850 kg of plastic debris and the successful establishment of 3,200 mangrove saplings with zero reported erosion breaches.",
  metrics: DEMO_METRICS,
  created_at: "2026-09-30T10:00:00Z",
};
