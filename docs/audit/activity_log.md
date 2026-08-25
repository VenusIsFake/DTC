# DTC Project Activity Log

This log records actions, milestones, scraping sessions, and structural updates to the DTC codebase.

---

## 2026-08-24
- **Project Initialization:**
  - Initialized Python environment (`.venv`) using `uv`.
  - Installed `instaloader` (v4.15.3).
  - Established `rules.md`, `overview.md`, and initial `/docs/` specifications (`README.md`, `planning.md`, `instagram_sync.md`).
  - Added documentation & graphify enforcement rules in `rules.md`.
  - Built resilient embed scraper pipeline (`scripts/parse_embed.py`) to bypass 429 datacenter rate-limiting.
  - Successfully extracted `@dentalkclub_fmdc` account profile, posts, captions, timestamps, likes, and comments.
  - Downloaded and analyzed 36 high-resolution pictures and media items.
  - Examined every individual image visually: identified speakers, lecture topics, stage awards, TEDxFMDC auditorium photo, debate table sessions, podcast BTS recording, and team retreats.
  - Created 10 semantic subcategories under `data/instagram/labeled/` with standardized semantic filenames (e.g. `magisterium_2026_speaker_01_hatim_elguerraoui.jpg`, `tedx_fmdc_amphitheater_group_photo.jpg`, `lets_talk_podcast_ep4_youtube_poster.jpg`).
  - Generated master mapping `data/instagram/labeled_images_catalog.json` and visual documentation in `docs/image_gallery.md`.
  - Authored comprehensive `docs/concept.md` detailing DTC's mission, organizational hierarchy, poles, key leaders, Magisterium/TEDxFMDC/Let's Talk events, brand identity, and web strategy.
  - Reorganized media into root `/instagram` directory across 5 clean folders (`events/`, `podcasts/`, `team/`, `awards/`, `magisterium/`, `metadata/`).
  - Fully de-duplicated all image files (0 duplicates) and removed the legacy `data/` folder.
  - Successfully connected active Chrome session and paginated across the entire **97-post timeline** of `@dentalkclub_fmdc` (Oct 2024 to present).
  - Extracted official 2025/2026 Executive Bureau announcement visual (`DLDCuK1tg_i`) saved at `instagram/team/bureau_executif_2025_2026.jpg` for full-width showcase in the About section.
  - Downloaded all **8 full MP4 video reels** for the TEDxFMDC talks (~80 MB total) into `instagram/events/` (`tedx_01_yahia_chemsi.mp4` through `tedx_08_fahd_rahim.mp4`) with matching poster thumbnails.
  - Extracted authentic original circular DTC logo directly from founding post `DBMRjqrAGlM` and saved at `instagram/metadata/dtc_logo.png` (716x716 PNG with transparency).
  - Executed exhaustive documentation refresh across all repository documents:
    * `docs/concept.md`: Full master concept, 2025/2026 Bureau Exécutif Mermaid hierarchy, 5 poles, TEDx talks, and authentic branding.
    * `docs/planning.md`: Complete website technical implementation plan, component architecture, video player specs, and tokens.
    * `docs/image_gallery.md`: Master catalog of all 8 TEDx video reels, podcast posters, team infographics, and awards.
    * `docs/instagram_data.md`: Analytical breakdown of all 97 posts from October 2024 to present.
    * `docs/instagram_sync.md`: Complete scraper pipeline, Chrome session authentication, and JSON data schemas.
    * `docs/README.md` & `overview.md`: Refreshed master hub and project overview.
  - Linked Vercel project `venus55/dtc` with active authentication (`venusisfake`).
  - Added `.vercelignore` preventing `.venv/`, `scripts/`, `docs/`, and `graphify-out/` from unnecessary upload.
  - Generated multi-resolution favicons and Apple touch icons (`public/favicon.ico`, `public/favicon.png`, `public/apple-touch-icon.png`, `src/app/icon.png`) directly from the authentic original DTC logo.
  - Built Next.js 14+ App Router application with all 5 core routes (`/`, `/events`, `/podcast`, `/gallery`, `/about`).
  - Deployed production release to Vercel and assigned official branded domain aliases:
    * Primary Production: `https://dentalkclub-fmdc.vercel.app`
    * Short Alias: `https://dtc-fmdc.vercel.app`
    * Verified 100% 200 OK status codes across all routes.
  - Resolved and verified authentic YouTube video stream IDs for Let's Talk Podcast episodes on channel `@LetsTalkPodcast-00`:
    * Ep. 4 (Pr. Sidi Mohamed Bouzoubaa): `FXTjMfmNmss`
    * Ep. 3 (Pr. Sofia Haitami): `JoMwnQbmKm0`
    * Ep. 2 (Pr. Amine Chafii): `C1dKfXuC0us`
    * Ep. 1 (Pr. Said Dhaimy): `njrC04ZxJo0` / `dT1kpZzarEs`
  - Created `docs/deployment.md` documenting fast-push optimization techniques (`npm run fast-deploy` reducing push times to <7s), Git CI/CD, and DNS records.
  - Resolved iPhone / iOS Safari blank screen bug:
    * Replaced Framer Motion SSR `initial={{ opacity: 0 }}` inline styles with hardware-accelerated CSS animations (`@keyframes fadeInSlideUp`) ensuring 100% immediate render on first paint.
    * Removed WebKit momentum scrolling bug caused by `scroll-smooth` on root `<html>`.
    * Upgraded `VideoPlayerModal.tsx` for iOS Safari autoplay compliance (`muted={true}`, `playsInline`, `webkit-playsinline`, and iOS `webkitEnterFullscreen()`).
    * Configured compliant YouTube iframe embeds with `playsinline=1` and `web-share` permissions.
  - Implemented mobile space-efficiency optimizations:
    * Removed artificial `min-h-[75vh]` vertical height stretching from `Hero.tsx`.
    * Eliminated empty space between action buttons and live stats cards.
    * Compacted navbar, padding scales, and 2-column mobile grids across `/events`, `/podcast`, `/gallery`, and `/about`.
  - Applied web video reel optimization across all 8 TEDx MP4s:
    * Re-encoded via ffmpeg (`scale=480:-2`, `libx264`, `crf 32`, `aac 64k`, `+faststart`).
    * Reduced total video payload from 83.7 MB down to 29.9 MB with instant progressive streaming metadata.
  - Deployed verified production release to Vercel and assigned live domain aliases:
    * Primary Domain: `https://dentalkclub-fmdc.vercel.app`
    * Short Domain: `https://dtc-fmdc.vercel.app`
  - Rebuilt repository knowledge graph using graphify.

## 2026-08-25 — Production-readiness audit & remediation
- **Four-way parallel audit** executed against the live production build, covering: (1) data integrity, (2) frontend code quality, (3) production/SEO configuration, and (4) documentation hygiene.
- **Key findings:**
  * iOS body-scroll-lock was broken: `VideoPlayerModal` and `InfographicViewer` each manipulated `document.body.style` independently and could leave the page scroll-locked after close.
  * Interactive card elements were non-focusable `<div>`s with click handlers — inaccessible via keyboard.
  * No `robots.txt`, no `sitemap.xml`, and no security headers were emitted by the static export / hosting config.
  * `metadataBase` pointed at the unattached domain `dtc.fmdc.ma` instead of the canonical `https://dentalkclub-fmdc.vercel.app`.
  * Podcast Episode 2 was rendered with Episode 4's poster image.
  * Mandate-label conflict: the Executive Bureau announcement post caption called it an update "pour le reste du mandat 2024-2026", while the asset filename and most docs used 2025–2026. Canonicalized user-facing label to **"Mandat 2025–2026"**, matching `bureau_executif_2025_2026.jpg`; the original IG caption is retained here as the historical record.
  * 82 MB of TEDx MP4 reels shipped statically inside the prebuilt output (~87 MB total).
  * Documentation trees were stale (`planning.md` / `image_gallery.md` / `instagram_sync.md` references, flat docs layout, dead `graph.html` pointer).
  * Python pipeline dependencies were undeclared (no `pyproject.toml` despite `.venv` usage).
  * Five dead scripts still targeted the deleted `data/` tree.
- **Remediations applied (code, by main agent):**
  * Introduced a shared `useBodyScrollLock` hook; both modals now lock/unlock body scroll safely.
  * Replaced clickable card `<div>`s with `<button>` elements and added keyboard focus management.
  * Added pan clamping in `InfographicViewer` so content cannot be dragged out of view.
  * Fixed the navbar mobile drawer (close-on-navigate behavior and state reset).
  * Added `robots.ts` and `sitemap.ts`; added security headers via `vercel.json`.
  * Corrected `metadataBase` and added per-route metadata; replaced the default 404 with a French localized not-found page.
  * Fixed the Podcast Episode 2 poster to its own artwork.
  * Pruned unused npm dependencies from `package.json`.
- **Remediations applied (documentation, by docs-repair agent):**
  * Rebuilt the repository trees in `overview.md` and `docs/platform/architecture.md` to mirror reality (docs subfolders, `instagram/magisterium/`, `scripts/`, `graphify-out/GRAPH_REPORT.md` + `graph.json`); removed stale `planning.md` / `image_gallery.md` / `instagram_sync.md` references outside this log.
  * Converted all absolute filesystem-style (`file://`) markdown links to repo-relative links.
  * Standardized facts: Instagram posting timeline begins October 16, 2024 (club founded November 2024); TEDx reels are 8 total — 7 at 720x1280, talk #5 (`DR2qD2mAMT8`) at 360x640; podcast Episode 3 guest canonicalized to "Pr. Sofia Haitami"; episode identifiers labeled explicitly as `instagram_post:` shortcodes vs `youtube_id:` values.
  * Added a Magisterium section cataloging `instagram/magisterium/` in `docs/media/gallery.md`.
  * Expanded the script roster in `docs/media/scraper_pipeline.md` to all 12 scripts, marked the 5 legacy ones retired, and replaced hardcoded credentials/IDs with placeholders.
  * Harmonized deployment claims in `docs/platform/deployment.md` (<7 seconds; ~580 KB applies only to delta pushes with unchanged media; full prebuilt output ≈87 MB including 82 MB of TEDx MP4s).
  * Moved the five dead scripts into `scripts/legacy/` and created `pyproject.toml` declaring the pipeline dependencies (instaloader, browser_cookie3, Pillow).
