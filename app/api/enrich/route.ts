import { NextResponse } from "next/server";
import { analyzeFieldMedia, generateEmbedding, buildEmbeddingDocument } from "@/lib/ai";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cloudinary } from "@/lib/cloudinary";

// In-memory rate limiter (relaxed for development and multi-file batch uploads)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = process.env.NODE_ENV === "production" ? 60 : 300;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function parseGpsCoordinate(coordStr?: string, ref?: string): number | null {
  if (!coordStr) return null;
  const num = parseFloat(coordStr);
  if (!isNaN(num) && !coordStr.includes("deg")) {
    return ref === "S" || ref === "W" ? -Math.abs(num) : num;
  }
  const match = coordStr.match(/(\d+)\s*deg\s*(\d+)?['′]?\s*([\d.]+)?["″]?/i);
  if (match) {
    const deg = parseFloat(match[1]) || 0;
    const min = parseFloat(match[2]) || 0;
    const sec = parseFloat(match[3]) || 0;
    let dec = deg + min / 60 + sec / 3600;
    if (ref === "S" || ref === "W") dec = -dec;
    return dec;
  }
  return null;
}

/**
 * Verifies that a Cloudinary public_id actually exists in the account and extracts EXIF metadata.
 * Prevents abuse while being resilient to Admin API rate limits and indexing replication lags.
 */
async function verifyCloudinaryAsset(
  publicId: string,
  secureUrl?: string,
  resourceType: string = "image"
): Promise<{ isValid: boolean; resource?: Record<string, unknown> }> {
  // If Cloudinary secrets are not present, permit local development/mock uploads
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
    return { isValid: true };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && secureUrl && !secureUrl.includes(`res.cloudinary.com/${cloudName}/`)) {
    console.warn("Rejecting enrichment: URL does not belong to authorized Cloudinary cloud:", secureUrl);
    return { isValid: false };
  }

  try {
    const validResourceType =
      resourceType === "video" || resourceType === "raw" ? resourceType : "image";
    const result = await cloudinary.api.resource(publicId, {
      resource_type: validResourceType,
      image_metadata: true,
      exif: true,
    });
    if (result?.public_id) {
      return { isValid: true, resource: result as Record<string, unknown> };
    }
    return { isValid: false };
  } catch (err) {
    console.warn("Cloudinary resource verification API call warning (possible rate limit or indexing lag):", err);
    // If Admin API is throttled or lagging, but URL matches our authenticated cloud name, permit enrichment
    if (cloudName && secureUrl && secureUrl.includes(`res.cloudinary.com/${cloudName}/`)) {
      return { isValid: true };
    }
    return { isValid: false };
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting by IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX} requests per minute.` },
        { status: 429 }
      );
    }

    const {
      asset_id,
      secure_url,
      public_id,
      cld_asset_id,
      version,
      resource_type,
      format,
      bytes,
      width,
      height,
      etag,
      original_filename,
      site_id,
      project_id,
      device: clientDevice,
      gps_lat: clientGpsLat,
      gps_lng: clientGpsLng,
      captured_at: clientCapturedAt,
    } = await req.json();

    if (!secure_url || !public_id) {
      return NextResponse.json(
        { error: "Missing secure_url or public_id" },
        { status: 400 }
      );
    }

    // Security: Verify the public_id exists in our Cloudinary account
    const verification = await verifyCloudinaryAsset(public_id, secure_url, resource_type);
    if (!verification.isValid) {
      return NextResponse.json(
        { error: "Asset not found in Cloudinary. Enrichment rejected." },
        { status: 403 }
      );
    }
    const cldRes = verification.resource;

    console.log("Starting Gemini Vision analysis for:", public_id);
    const enrichment = await analyzeFieldMedia(secure_url);

    // Generate semantic embedding from the enrichment output
    const embeddingDoc = buildEmbeddingDocument(enrichment);
    const embedding = await generateEmbedding(embeddingDoc);

    // Extract real EXIF / camera / GPS metadata from Cloudinary if present
    const meta = (cldRes?.image_metadata as Record<string, string | undefined>) || {};
    const exif = (cldRes?.exif as Record<string, string | undefined>) || {};

    const make = meta.Make || exif.Make;
    const model = meta.Model || exif.Model;
    const cldDevice = model ? (make && !model.toLowerCase().includes(make.toLowerCase()) ? `${make} ${model}` : model) : make || null;
    const device = clientDevice || cldDevice || null;

    const rawDate = meta.DateTimeOriginal || exif.DateTimeOriginal;
    let captured_at: string | null = clientCapturedAt || null;
    if (!captured_at && rawDate && typeof rawDate === "string") {
      const formatted = rawDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
      const d = new Date(formatted);
      if (!isNaN(d.getTime())) captured_at = d.toISOString();
    }

    const cldGpsLat = parseGpsCoordinate(meta.GPSLatitude || exif.GPSLatitude, meta.GPSLatitudeRef || exif.GPSLatitudeRef);
    const cldGpsLng = parseGpsCoordinate(meta.GPSLongitude || exif.GPSLongitude, meta.GPSLongitudeRef || exif.GPSLongitudeRef);
    const gps_lat = clientGpsLat != null ? clientGpsLat : cldGpsLat;
    const gps_lng = clientGpsLng != null ? clientGpsLng : cldGpsLng;

    const cldEtag = typeof cldRes?.etag === "string" ? cldRes.etag : etag;
    const phash = cldEtag ? `0x${cldEtag.replace(/[^a-f0-9]/gi, "").slice(0, 12)}` : null;

    let savedAsset = null;

    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, unknown> = {
        caption: enrichment.caption,
        activity: enrichment.activity,
        scene: enrichment.scene,
        objects: enrichment.objects,
        tags: enrichment.tags || [],
        status: "ready",
        verification_score: 0.95,
        updated_at: new Date().toISOString(),
        ...(device ? { device } : {}),
        ...(captured_at ? { captured_at } : {}),
        ...(gps_lat != null ? { gps_lat } : {}),
        ...(gps_lng != null ? { gps_lng } : {}),
        ...(phash ? { phash } : {}),
        exif: Object.keys(meta).length > 0 ? meta : Object.keys(exif).length > 0 ? exif : null,
      };

      if (embedding) {
        payload.embedding = JSON.stringify(embedding);
      }

      // Check if asset already exists in DB
      let existingQuery = supabase.from("asset").select("id");
      if (asset_id) {
        existingQuery = existingQuery.eq("id", asset_id);
      } else {
        existingQuery = existingQuery.eq("cld_public_id", public_id);
      }

      const { data: existingRows } = await existingQuery.limit(1);

      if (existingRows && existingRows.length > 0) {
        const { data: updated } = await supabase
          .from("asset")
          .update(payload)
          .eq("id", existingRows[0].id)
          .select()
          .single();
        savedAsset = updated;
      } else {
        // Insert new asset record with guaranteed non-null fields
        const insertPayload: Record<string, unknown> = {
          ...payload,
          project_id: project_id || "00000000-0000-0000-0000-000000000001",
          site_id: site_id || "00000000-0000-0000-0000-000000000011",
          cld_public_id: public_id,
          cld_asset_id:
            cld_asset_id ||
            cldRes?.asset_id ||
            `cld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          cld_version: version || cldRes?.version || 1,
          cld_resource_type: resource_type || cldRes?.resource_type || "image",
          cld_format: format || cldRes?.format || "jpg",
          cld_secure_url: secure_url || cldRes?.secure_url,
          cld_etag: etag || cldRes?.etag || null,
          original_filename: original_filename || public_id.split("/").pop(),
          bytes: bytes || cldRes?.bytes || 0,
          width: width || cldRes?.width || 0,
          height: height || cldRes?.height || 0,
          device: device || null,
          captured_at: captured_at || null,
          gps_lat: gps_lat != null ? gps_lat : null,
          gps_lng: gps_lng != null ? gps_lng : null,
          phash: phash || null,
          exif: Object.keys(meta).length > 0 ? meta : Object.keys(exif).length > 0 ? exif : null,
        };

        const { data: inserted, error: insertError } = await supabase
          .from("asset")
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) {
          console.error("Failed to insert asset in Supabase:", insertError);
        } else {
          savedAsset = inserted;
          console.log("Successfully persisted asset into Supabase:", inserted?.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      enrichment,
      public_id,
      asset: savedAsset,
      has_embedding: !!embedding,
    });
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      { error: "Failed to enrich media with AI" },
      { status: 500 }
    );
  }
}
