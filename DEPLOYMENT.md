# 🚀 ImpactLens Deployment Guide

This guide walks through hosting **ImpactLens** on **Render** (as a persistent Node.js Web Service) and provides key configurations for production environments.

---

## 📋 Required Environment Variables

Ensure you have these values ready before deploying:

| Variable | Description | Where to Find |
|---|---|---|
| `NODE_VERSION` | Node.js runtime version (Set to `20.18.0`) | Render Environment variable |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account identifier | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Cloudinary Dashboard -> API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Cloudinary Dashboard -> API Keys |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client-accessible Cloud Name | Same as `CLOUDINARY_CLOUD_NAME` |
| `SUPABASE_URL` | Supabase project URL | Supabase -> Project Settings -> API |
| `SUPABASE_ANON_KEY` | Public anonymous JWT | Supabase -> Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated service role key (for server actions) | Supabase -> Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_URL` | Client-accessible Supabase URL | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-accessible Supabase Anon Key | Same as `SUPABASE_ANON_KEY` |
| `GEMINI_API_KEY` | Google Gemini AI API key | [Google AI Studio](https://aistudio.google.com/) |

---

## 🌐 Deploying on Render

### Method 1: Using the Render Blueprint (`render.yaml`) — Recommended

The repository includes a [render.yaml](render.yaml) blueprint that configures all settings automatically:

1. **Commit and push your changes to GitHub**:
   ```bash
   git add .
   git commit -m "chore: add render deployment configuration"
   git push origin main
   ```
2. Log in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** at the top right and select **Blueprint**.
4. Connect your GitHub repository (`ayushmishra-18/ImpactLens`).
5. Render will automatically detect `render.yaml` and prompt you to input the secret environment variables (`CLOUDINARY_*`, `SUPABASE_*`, `GEMINI_API_KEY`).
6. Click **Apply**. Render will automatically build and deploy your service!

---

### Method 2: Manual Web Service Setup

If you prefer to configure manually via the Render UI:

1. In [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Web Service**.
2. Connect your GitHub repository (`ayushmishra-18/ImpactLens`).
3. Fill in the deployment details:
   - **Name**: `impactlens`
   - **Region**: Choose the region closest to you or your Supabase instance (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free` (or `Starter` for persistent uptime without cold starts)
4. Scroll down to **Environment Variables** and add all variables listed in the table above (including `NODE_VERSION=20.18.0`).
5. Click **Create Web Service**.

---

## ⚡ Post-Deployment Configuration

### 1. Configure Cloudinary Webhook (Optional but Recommended)

ImpactLens provides an automated server-side webhook endpoint at `/api/webhooks/cloudinary` which processes uploads and runs Gemini Vision AI even if a user closes their browser before analysis completes.

1. Open your [Cloudinary Console](https://console.cloudinary.com/).
2. Navigate to **Settings (Gear Icon)** -> **Webhooks** (or Upload settings).
3. Set the **Notification URL** to:
   ```text
   https://<your-render-service-name>.onrender.com/api/webhooks/cloudinary
   ```
4. Save changes.

---

## 💡 Important Render Considerations

- **Free Tier Cold Starts**: Render's Free tier spins down web services after 15 minutes of inactivity. When a new request arrives, it may take 40–60 seconds to spin back up. If you are presenting or submitting for hackathon evaluation, consider upgrading to the **Starter** plan ($7/mo) during the evaluation window to keep it active 24/7.
- **Port Binding**: Next.js automatically detects the `PORT` environment variable injected by Render and binds properly to `0.0.0.0:$PORT`.
- **Alternative (Vercel)**: Because ImpactLens is built on Next.js 16 (React 19), you can also import this GitHub repo directly into [Vercel](https://vercel.com/) with zero configuration and instant serverless cold starts.
