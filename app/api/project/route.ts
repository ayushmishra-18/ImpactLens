import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { DEMO_PROJECT } from "@/lib/mock-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ project: DEMO_PROJECT, source: "mock" });
    }

    const { data: project, error } = await supabase
      .from("project")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !project) {
      return NextResponse.json({ project: DEMO_PROJECT, source: "fallback" });
    }

    return NextResponse.json({ project, source: "database" });
  } catch (err) {
    console.error("Project API error:", err);
    return NextResponse.json({ project: DEMO_PROJECT, source: "error" });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, category, cloudinary_folder } = body;

    const updatePayload: Record<string, string> = {};
    if (name && typeof name === "string") updatePayload.name = name.trim();
    if (description && typeof description === "string") updatePayload.description = description.trim();
    if (category && typeof category === "string") updatePayload.category = category.trim();
    if (cloudinary_folder && typeof cloudinary_folder === "string") updatePayload.cloudinary_folder = cloudinary_folder.trim();

    // Update the primary project
    const { data: existing } = await supabase.from("project").select("id").limit(1).maybeSingle();

    if (existing?.id) {
      const { data: updated, error } = await supabase
        .from("project")
        .update(updatePayload)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ project: updated, success: true });
    }

    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  } catch (err) {
    console.error("Update project API error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
