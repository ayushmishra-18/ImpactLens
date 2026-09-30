import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { synthesizeBeforeAfter } from "@/lib/ai";

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        comparisons: [],
        source: "empty",
      });
    }

    // Fetch comparisons from Supabase
    const { data: comparisons, error } = await supabase
      .from("comparison")
      .select(`
        *,
        before_asset:before_asset_id(*),
        after_asset:after_asset_id(*)
      `)
      .order("created_at", { ascending: false });

    if (!error && comparisons && comparisons.length > 0) {
      return NextResponse.json({
        comparisons,
        source: "database",
      });
    }

    // Return empty list if no comparisons recorded yet
    return NextResponse.json({
      comparisons: [],
      source: "empty",
    });
  } catch (err) {
    console.error("Comparison GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch comparisons" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { before_asset_id, after_asset_id, site_id, project_id } =
      await req.json();

    if (!before_asset_id || !after_asset_id) {
      return NextResponse.json(
        { error: "Missing before_asset_id or after_asset_id" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Fetch before & after assets from DB
    const { data: assets, error: assetError } = await supabase
      .from("asset")
      .select("*")
      .in("id", [before_asset_id, after_asset_id]);

    if (assetError || !assets || assets.length < 2) {
      return NextResponse.json(
        { error: "Could not find both assets to compare" },
        { status: 404 }
      );
    }

    const beforeAsset = assets.find((a) => a.id === before_asset_id);
    const afterAsset = assets.find((a) => a.id === after_asset_id);

    if (!beforeAsset || !afterAsset) {
      return NextResponse.json(
        { error: "Assets missing" },
        { status: 404 }
      );
    }

    // Run real-time Gemini AI Vision comparison
    console.log(
      "Synthesizing before/after comparison via Gemini AI for assets:",
      before_asset_id,
      after_asset_id
    );
    const aiResult = await synthesizeBeforeAfter(
      beforeAsset.cld_secure_url,
      afterAsset.cld_secure_url
    );

    // Save comparison to Supabase
    const { data: savedComparison, error: compError } = await supabase
      .from("comparison")
      .insert({
        project_id:
          project_id ||
          beforeAsset.project_id ||
          "00000000-0000-0000-0000-000000000001",
        site_id: site_id || beforeAsset.site_id,
        before_asset_id,
        after_asset_id,
        change_summary: aiResult.change_summary,
        summary_model: "gemini-2.5-flash-lite",
        suggested_by: "user",
      })
      .select(`
        *,
        before_asset:before_asset_id(*),
        after_asset:after_asset_id(*)
      `)
      .single();

    if (compError) {
      console.error("Failed to insert comparison:", compError);
    }

    return NextResponse.json({
      success: true,
      comparison: savedComparison || {
        before_asset_id,
        after_asset_id,
        change_summary: aiResult.change_summary,
        before_asset: beforeAsset,
        after_asset: afterAsset,
      },
      key_changes: aiResult.key_changes,
    });
  } catch (err) {
    console.error("Comparison POST error:", err);
    return NextResponse.json(
      { error: "Failed to create comparison" },
      { status: 500 }
    );
  }
}
