import { z } from "zod";

export type Role = "admin" | "field" | "analyst" | "viewer";
export type AssetStatus = "uploaded" | "processing" | "ready" | "needs_enrichment" | "failed";
export type ResourceType = "image" | "video";

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  org_id?: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Project {
  id: string;
  org_id?: string;
  name: string;
  description?: string;
  category?: string; // reforestation, water, waste, clean_energy, etc.
  start_date?: string;
  end_date?: string;
  cloudinary_folder: string;
  created_at: string;
}

export interface Site {
  id: string;
  project_id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  radius_m?: number;
  created_at: string;
}

export interface VerificationFlags {
  has_gps: boolean;
  has_timestamp: boolean;
  duplicate: boolean;
  edited: boolean;
}

export interface DetectedObject {
  label: string;
  count: number;
  confidence: number;
}

export interface Asset {
  id: string;
  project_id: string;
  site_id?: string;
  site?: Site;
  uploaded_by?: string;

  // Cloudinary linkage & traceability
  cld_public_id: string;
  cld_asset_id: string;
  cld_version: number;
  cld_resource_type: ResourceType;
  cld_format?: string;
  cld_secure_url: string;
  cld_etag?: string;
  original_filename?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration_sec?: number;

  // Capture metadata
  captured_at?: string;
  gps_lat?: number;
  gps_lng?: number;
  device?: string;
  exif?: Record<string, unknown>;

  // AI outputs
  caption?: string;
  activity?: string;
  scene?: string;
  objects?: DetectedObject[];
  tags?: string[];
  embedding?: number[];

  // Quality & verification
  status: AssetStatus;
  verification_score?: number; // 0..1
  verification_flags?: VerificationFlags;
  phash?: string;
  duplicate_of?: string;

  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface AssetTag {
  asset_id: string;
  tag_id: string;
  tag?: Tag;
  source: "cloudinary" | "llm" | "user";
  confidence?: number;
  approved?: boolean | null;
}

export interface Enrichment {
  id: string;
  asset_id: string;
  provider: string; // 'cloudinary_tagging' | 'claude_vision' | 'embeddings'
  model?: string;
  raw_output?: Record<string, unknown>;
  status?: string;
  created_at: string;
}

export interface Comparison {
  id: string;
  project_id: string;
  site_id?: string;
  before_asset_id: string;
  after_asset_id: string;
  before_asset?: Asset;
  after_asset?: Asset;
  change_summary?: string;
  summary_model?: string;
  suggested_by: "auto" | "user";
  created_at: string;
}

export interface ReportItem {
  id: string;
  report_id: string;
  position: number;
  kind: "asset" | "comparison" | "metric" | "text";
  asset_id?: string;
  comparison_id?: string;
  derived_url?: string;
  transformation?: string;
  caption?: string;
  asset?: Asset;
  comparison?: Comparison;
}

export interface Report {
  id: string;
  project_id: string;
  title: string;
  date_from?: string;
  date_to?: string;
  sections?: Record<string, unknown>;
  executive_summary?: string;
  metrics?: Record<string, unknown>;
  share_token?: string;
  pdf_url?: string;
  created_by?: string;
  created_at: string;
  items?: ReportItem[];
}

export interface CampaignAsset {
  id: string;
  project_id: string;
  source_asset_id?: string;
  source_comparison_id?: string;
  template: "ig_square" | "story" | "linkedin_banner" | "reel";
  headline?: string;
  caption?: string;
  hashtags?: string[];
  derived_url: string;
  transformation: string;
  created_at: string;
}

export interface DerivedAsset {
  id: string;
  source_asset_id: string;
  purpose: "thumbnail" | "comparison" | "report" | "campaign";
  transformation: string;
  derived_url: string;
  created_at: string;
}

export interface AuditEvent {
  id: number;
  asset_id: string;
  actor?: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// Zod schemas for AI JSON Contracts
export const aiEnrichmentSchema = z.object({
  caption: z.string().describe("Concise 1-sentence caption of visible field evidence"),
  activity: z.string().describe("Canonical activity identifier, e.g. tree_planting, cleanup, construction, water_testing"),
  scene: z.string().describe("Scene setting, e.g. outdoor_riverbank, urban_park, rural_farmland"),
  objects: z.array(
    z.object({
      label: z.string(),
      count: z.number().int().nonnegative(),
      confidence: z.number().min(0).max(1),
    })
  ),
  tags: z.array(z.string()),
  visible_signals: z.array(z.string()).optional(),
});

export type AIEnrichmentOutput = z.infer<typeof aiEnrichmentSchema>;

export const comparisonSummarySchema = z.object({
  change_summary: z.string().describe("Objective description of visible differences between before and after media"),
  key_changes: z.array(z.string()).describe("Bullet points of visible changes"),
  confidence_score: z.number().min(0).max(1),
});

export type ComparisonSummaryOutput = z.infer<typeof comparisonSummarySchema>;
