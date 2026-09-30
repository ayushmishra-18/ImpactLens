import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { analyzeFieldMedia, generateEmbedding, buildEmbeddingDocument } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verify Cloudinary webhook or parse payload
    const {
      public_id,
      asset_id,
      version,
      resource_type,
      format,
      secure_url,
      etag,
      bytes,
      width,
      height,
      duration,
      image_metadata,
    } = payload;

    console.log("Cloudinary webhook received for asset:", public_id);

    if (isSupabaseConfigured && supabaseAdmin) {
      let targetAssetId: string | null = null;

      // Check if asset was already recorded by the client upload flow
      const { data: existing } = await supabaseAdmin
        .from("asset")
        .select("id, status")
        .or(`cld_asset_id.eq.${asset_id},cld_public_id.eq.${public_id}`)
        .limit(1)
        .maybeSingle();

      if (existing) {
        targetAssetId = existing.id;
        // If not already enriched, update metadata
        if (existing.status !== "ready") {
          await supabaseAdmin
            .from("asset")
            .update({
              cld_version: version,
              cld_format: format,
              cld_secure_url: secure_url,
              bytes,
              width,
              height,
              duration_sec: duration,
              exif: image_metadata || {},
            })
            .eq("id", existing.id);
        }
      } else {
        // Step 1: Insert new asset record
        const { data: insertedAsset, error } = await supabaseAdmin
          .from("asset")
          .insert({
            cld_public_id: public_id,
            cld_asset_id: asset_id,
            cld_version: version,
            cld_resource_type: resource_type || "image",
            cld_format: format,
            cld_secure_url: secure_url,
            cld_etag: etag,
            bytes,
            width,
            height,
            duration_sec: duration,
            exif: image_metadata || {},
            status: "processing",
          })
          .select("id")
          .single();

        if (insertedAsset) {
          targetAssetId = insertedAsset.id;
        } else if (error) {
          console.error("Database insert error:", error);
        }
      }

      // Step 2: Trigger async enrichment (runs server-side, not dependent on client)
      if (targetAssetId && secure_url) {
        enrichAssetAsync(targetAssetId, secure_url).catch((err) =>
          console.error("Background enrichment failed for", public_id, err)
        );
      }
    }

    return NextResponse.json({
      received: true,
      public_id,
      status: "enqueued_for_enrichment",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}

/**
 * Async background enrichment — runs AI analysis and embedding generation
 * independently of the webhook response cycle. This decouples upload
 * completion from AI processing, preventing data loss if the client disconnects.
 */
async function enrichAssetAsync(assetDbId: string, secureUrl: string) {
  if (!supabaseAdmin) return;

  try {
    console.log("Starting async enrichment for asset:", assetDbId);

    // Run Gemini Vision analysis
    const enrichment = await analyzeFieldMedia(secureUrl);

    // Generate semantic embedding
    const embeddingDoc = buildEmbeddingDocument(enrichment);
    const embedding = await generateEmbedding(embeddingDoc);

    const updatePayload: Record<string, unknown> = {
      caption: enrichment.caption,
      activity: enrichment.activity,
      scene: enrichment.scene,
      objects: enrichment.objects,
      tags: enrichment.tags || [],
      status: "ready",
      verification_score: 0.95,
      updated_at: new Date().toISOString(),
    };

    if (embedding) {
      updatePayload.embedding = JSON.stringify(embedding);
    }

    const { error } = await supabaseAdmin
      .from("asset")
      .update(updatePayload)
      .eq("id", assetDbId);

    if (error) {
      console.error("Async enrichment DB update failed:", error);
      // Mark as needs_enrichment so it can be retried
      await supabaseAdmin
        .from("asset")
        .update({ status: "needs_enrichment" })
        .eq("id", assetDbId);
    } else {
      console.log("Async enrichment completed for asset:", assetDbId);
    }
  } catch (err) {
    console.error("Async enrichment error:", err);
    await supabaseAdmin
      .from("asset")
      .update({ status: "needs_enrichment" })
      .eq("id", assetDbId);
  }
}
