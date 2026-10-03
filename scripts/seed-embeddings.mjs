import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Simple env loader with fallback to process.env
const envVars = { ...process.env };
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

const geminiApiKey = envVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const supabaseUrl = envVars.SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = envVars.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!geminiApiKey || !supabaseUrl || !supabaseKey) {
  console.error("Missing required environment variables: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: 768,
  });
  return result.embedding.values;
}

async function main() {
  const { data: assets, error } = await supabase.from("asset").select("id, caption, activity, scene");
  if (error) {
    console.error("Error fetching assets:", error);
    return;
  }

  console.log(`Found ${assets.length} assets to embed`);

  for (const asset of assets) {
    const textToEmbed = `${asset.caption}. Activity: ${asset.activity}. Scene: ${asset.scene || ""}`;
    console.log(`Generating embedding for asset ${asset.id}...`);
    const embedding = await generateEmbedding(textToEmbed);
    console.log(`Got embedding of length ${embedding.length}`);

    const tags = asset.activity === "tree_planting" 
      ? ["mangroves", "restoration", "saplings", "soil stabilization"]
      : asset.activity === "cleanup"
      ? ["cleanup", "volunteers", "plastic waste", "segregation"]
      : ["conservation", "ecosystem", "habitat", "environmental monitoring"];

    const { error: updateError } = await supabase
      .from("asset")
      .update({
        embedding: JSON.stringify(embedding),
        tags: tags
      })
      .eq("id", asset.id);

    if (updateError) {
      console.error(`Failed to update asset ${asset.id}:`, updateError);
    } else {
      console.log(`Successfully updated asset ${asset.id}`);
    }
  }

  console.log("SUCCESS: All assets populated with Gemini gemini-embedding-001 vectors (768d)!");
}

main().catch(console.error);
