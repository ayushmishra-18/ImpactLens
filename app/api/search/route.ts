import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/ai";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const activity = searchParams.get("activity") || "all";
    const siteId = searchParams.get("site_id") || "all";
    const mode = searchParams.get("mode") || "hybrid"; // "text" | "semantic" | "hybrid"

    if (isSupabaseConfigured && supabase) {
      // ── Semantic Vector Search Path ──
      // If a query is provided and semantic mode is enabled, try pgvector first
      if (q && (mode === "semantic" || mode === "hybrid")) {
        const queryEmbedding = await generateEmbedding(q);

        if (queryEmbedding) {
          // Use Supabase RPC to call a pgvector cosine similarity function
          const { data: vectorResults, error: vecError } = await supabase.rpc(
            "match_assets_by_embedding",
            {
              query_embedding: JSON.stringify(queryEmbedding),
              match_threshold: 0.3,
              match_count: 50,
              filter_activity: activity !== "all" ? activity : null,
              filter_site_id: siteId !== "all" ? siteId : null,
            }
          );

          if (!vecError && vectorResults && vectorResults.length > 0) {
            return NextResponse.json({
              assets: vectorResults,
              total: vectorResults.length,
              source: "semantic_vector",
            });
          }
        }
      }

      // ── Text Fallback Path ──
      let query = supabase.from("asset").select("*, site(*)");

      if (activity !== "all") {
        query = query.eq("activity", activity);
      }
      if (siteId !== "all") {
        query = query.eq("site_id", siteId);
      }
      if (q) {
        // Sanitize query to avoid PostgREST syntax errors with special filter characters
        const cleanQ = q.replace(/[%,()]/g, "").trim();
        if (cleanQ) {
          query = query.or(
            `caption.ilike.%${cleanQ}%,activity.ilike.%${cleanQ}%,scene.ilike.%${cleanQ}%`
          );
        }
      }

      query = query.order("created_at", { ascending: false }).limit(100);

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({
          assets: data,
          total: data.length,
          source: "database",
        });
      }
    }

    return NextResponse.json({
      assets: [],
      total: 0,
      source: "database",
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
