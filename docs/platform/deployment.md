# Vercel Deployment & Fast-Push Optimization Guide

This guide details the deployment pipeline, DNS configuration, and performance optimization techniques to make Vercel deployments **lightning-fast (< 7 seconds)** for the **Dentalk Club FMDC (DTC)** web platform.

---

## ⚡ 1. Why Were Deployments Taking ~30–40 Seconds?

In the initial setup, the repository included the **TEDx MP4 video reels** (7× 720x1280, talk #5 at 360x640) in `public/media/events/` totaling **~82 MB**. 

When running standard `vercel --prod`, the CLI checks and uploads all local static assets across your home internet connection.

---

## 🚀 2. Three Proven Methods to Cut Vercel Pushing to Seconds

### Method 1: Prebuilt Deployments (`npm run fast-deploy`) — *Recommended CLI Command (< 7s)*
Instead of letting the cloud rebuild and re-upload every asset from scratch, we configured `output: "export"` in `next.config.mjs` and an npm shortcut in `package.json`:
```bash
# Instant local build + prebuilt delta upload in under 7 seconds
npm run fast-deploy
```
> **Speed Gain:** The **~580 KB** payload figure applies only to **delta pushes where the media under `public/media/` is unchanged** — Vercel's prebuilt flow re-uploads just the changed chunks. A full first upload ships the entire prebuilt `out/` directory, currently **≈87 MB** including **82 MB of TEDx MP4 reels**, and takes correspondingly longer. Completing a delta push typically takes **6–7 seconds**.

---

### Method 2: Git-Integrated Cloud CI/CD (`git push`) — *Zero Local Uploads*
When the repository is pushed to GitHub, GitLab, or Bitbucket:
```bash
git add .
git commit -m "feat: update podcast and events"
git push origin main
```
* **How it works:** Vercel receives a webhook from GitHub and clones the repository directly in Vercel's high-speed cloud infrastructure.
* **Your machine uploads:** Only the code diff (few KBs).

---

### Method 3: Cloudflare R2 / BunnyCDN / YouTube for MP4 Video Reels
By offloading the 82 MB MP4 reels to free object storage (Cloudflare R2, Supabase Storage, or BunnyCDN) or streaming them instead of serving static files:
* The Next.js repository size drops from **≈87 MB down to < 5 MB**.
* Full `vercel --prod` uploads drop from ~87 MB to a few MB, cutting minutes of upload time.

> **Future option (flagged):** Host the 8 TEDx video reels on the club's own YouTube channel ([`@LetsTalkPodcast-00`](https://www.youtube.com/@LetsTalkPodcast-00)) and embed them — removing the 82 MB static payload entirely at zero storage cost. Not yet implemented.

---

## 🌐 3. Current Live Domains & DNS Mapping

| Domain Type | Live URL | Target Vercel Deployment |
| :--- | :--- | :--- |
| **Primary Production Domain** | **[https://dentalkclub-fmdc.vercel.app](https://dentalkclub-fmdc.vercel.app)** | Production Latest |
| **Short Domain Alias** | **[https://dtc-fmdc.vercel.app](https://dtc-fmdc.vercel.app)** | Production Latest |
| **Direct Project URL** | **[https://dtc-lilac.vercel.app](https://dtc-lilac.vercel.app)** | Production Latest |

---

## 🛡️ 4. Essential Deployment Settings Summary

* **Project Name:** `dtc`
* **Team / Owner:** `venus55` (Account: `venusisfake`)
* **Framework Preset:** `Next.js` (App Router)
* **SSO / Protected Deployment:** **Disabled** (Publicly accessible globally without login walls)
* **`.vercelignore` Configuration:**
  ```text
  .venv/
  scripts/
  docs/
  graphify-out/
  instagram/
  rules.md
  overview.md
  *.log
  ```
