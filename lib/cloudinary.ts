import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server-side SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Generate signed upload parameters for direct client-side upload to Cloudinary.
 */
export function generateSignedUploadParams(folder: string, tags: string[] = []) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error("Cloudinary environment variables are missing");
  }

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };

  if (tags.length > 0) {
    paramsToSign.tags = tags.join(",");
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  };
}

/**
 * Build content-aware transformation URL for before/after comparison alignment.
 */
export function getAlignedComparisonUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
  } = {}
) {
  const {
    width = 1200,
    height = 800,
    crop = "fill",
    gravity = "auto",
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    gravity,
    fetch_format: "auto",
    quality: "auto",
    secure: true,
  });
}

/**
 * Generate Campaign card with text overlays and brand framing.
 */
export function getCampaignCardUrl(
  publicId: string,
  options: {
    template: "ig_square" | "story" | "linkedin_banner" | "reel" | "1:1" | "4:5" | "9:16" | "16:9";
    headline?: string;
    subheadline?: string;
  }
) {
  let width = 1080;
  let height = 1080;

  switch (options.template) {
    case "story":
    case "9:16":
    case "reel":
      width = 1080;
      height = 1920;
      break;
    case "linkedin_banner":
    case "16:9":
      width = 1200;
      height = 675;
      break;
    case "4:5":
      width = 1080;
      height = 1350;
      break;
    case "ig_square":
    case "1:1":
    default:
      width = 1080;
      height = 1080;
      break;
  }

  const transformation: Record<string, unknown>[] = [
    {
      width,
      height,
      crop: "fill",
      gravity: "auto",
      fetch_format: "auto",
      quality: "auto",
    },
  ];

  if (options.headline) {
    transformation.push({
      overlay: {
        font_family: "Arial",
        font_size: width < 1200 ? 38 : 44,
        font_weight: "bold",
        text: encodeURIComponent(options.headline),
      },
      gravity: "south_west",
      x: 50,
      y: options.subheadline ? 100 : 60,
      color: "#FFFFFF",
    });
  }

  if (options.subheadline) {
    transformation.push({
      overlay: {
        font_family: "Arial",
        font_size: width < 1200 ? 22 : 26,
        font_weight: "normal",
        text: encodeURIComponent(options.subheadline),
      },
      gravity: "south_west",
      x: 50,
      y: 50,
      color: "#D3DEEA",
    });
  }

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
}
