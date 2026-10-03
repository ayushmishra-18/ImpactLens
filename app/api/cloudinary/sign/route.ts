import { NextResponse } from "next/server";
import { generateSignedUploadParams } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "impactlens/general";
    const tags = body.tags || [];

    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      // Return mock signature parameters for seamless local development
      return NextResponse.json({
        signature: "mock_signature_for_dev",
        timestamp: Math.round(Date.now() / 1000),
        apiKey: apiKey || "mock_api_key",
        cloudName: cloudName || "impactlens-demo",
        folder,
        isMock: true,
      });
    }

    const params = generateSignedUploadParams(folder, tags);
    return NextResponse.json(params);
  } catch (error: unknown) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      { error: "Failed to generate signed upload parameters" },
      { status: 500 }
    );
  }
}
