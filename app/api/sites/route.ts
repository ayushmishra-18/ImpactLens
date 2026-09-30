import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ sites: [], source: "empty" });
    }

    const { data: sites, error } = await supabase
      .from("site")
      .select("*")
      .order("name", { ascending: true });

    if (error || !sites) {
      return NextResponse.json({ sites: [], source: "empty" });
    }

    return NextResponse.json({ sites, source: "database" });
  } catch (err) {
    console.error("Sites API error:", err);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }
}
