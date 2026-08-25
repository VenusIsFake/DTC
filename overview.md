# Dentalk Club FMDC (DTC) — Project Overview

The official digital archive, media ecosystem, and web platform for **Dentalk Club FMDC (DTC)** at the *Faculté de Médecine Dentaire de Casablanca* (Université Hassan II).

---

## 🎯 About Dentalk Club FMDC

Founded in **November 2024**, Dentalk Club FMDC is the premier student organization dedicated to public speaking, medical eloquence, clinical debate, and multidisciplinary dialogue at Casablanca's Dental Medicine Faculty.

* **Official Motto:** *"Let your voice be heard with endless echoes."* 🎙️
* **Handle:** [`@dentalkclub_fmdc`](https://www.instagram.com/dentalkclub_fmdc/)
* **YouTube Channel:** [`@LetsTalkPodcast-00`](https://www.youtube.com/@LetsTalkPodcast-00)
* **Founding:** November 2024
* **Governance (2025–2026):** 12-member Executive Bureau led by President **El Guerraoui Hatim**.

---

## 🌐 Live Production Platform & DNS

* **Primary Branded Domain:** **[https://dentalkclub-fmdc.vercel.app](https://dentalkclub-fmdc.vercel.app)**
* **Short Domain Alias:** **[https://dtc-fmdc.vercel.app](https://dtc-fmdc.vercel.app)**
* **Direct Project URL:** **[https://dtc-lilac.vercel.app](https://dtc-lilac.vercel.app)**

---

## 🏛️ Club Platform Layer (2026-08-25)

The site evolved from a static brochure into a **two-layer platform** on a **standard Vercel server deployment** with **Supabase** (Postgres + RLS + Auth + Storage):

* **Member features:** email/password auth (open signup), roles `member → bureau → admin`; `/annonces` (atelier feed + RSVP + live headcount), `/idees` (pitch + 1-vote-per-person + comments + bureau status badges), `/espace` (profil : promo, commission, avatar, bio, téléphone + « Mes activités » + panneau admin), `/espace/annuaire` (annuaire membres uniquement).
* **Backoffice:** hidden `/admin` console — Utilisateurs (rôles/bannissements), Annonces (+ « Notifier par email » via Resend), Idées (modération), **Podcast Studio** (import YouTube par URL), Événements (visibilité de section, CRUD TEDx, pages `/events/[slug]`), **Galerie** (CRUD + upload), À propos (sections éditables, stats, mandats + infographies, archivage automatique), Commissions & listes.
* **Live updates:** Supabase Realtime — vote counts, comments and RSVP headcounts refresh live for everyone (debounced refetch, RLS-filtered delivery).
* **Resilience & security:** every public page falls back to the static `src/data` seeds when the DB is unreachable; RLS is the enforcement layer (contact info bureau-only via security-definer RPCs); `events_visible` masque réellement la section (redirect + nav + sitemap); forgot-password flow (email reset link); optional Turnstile captcha + Resend email broadcast (dormant until configured).
* **Client caching:** hand-rolled service worker (rules.md §10) — network-first pages (new deploys visible on next load), immutable assets cached, media stale-while-revalidate; `/media` served with 1-day Cache-Control + SWR. Built for Vercel Hobby bandwidth.
* **Engineering:** Next.js **15.5** + React 19 (npm audit clean), CI on GitHub Actions (tsc/lint/vitest/build), 14 vitest unit tests, weekly pg_dump backups to Actions artifacts.
* **Status:** live; DB schema v2 applied (FK indexes, RLS init-plan fix, RSVP count cache, realtime publication, gallery table + seed).

---

## 📂 Repository Structure

```text
DTC/
├── docs/                       # Comprehensive documentation hub
│   ├── README.md               # Master documentation index
│   ├── club/
│   │   └── concept.md          # Master club concept, governance hierarchy & events
│   ├── platform/
│   │   ├── architecture.md     # Website technical architecture & component specs
│   │   └── deployment.md       # Server deployment, Supabase setup checklist, DNS
│   ├── media/
│   │   ├── gallery.md          # Complete catalog of 8 TEDx video reels & photos
│   │   ├── instagram_data.md   # Deep analytical breakdown of all 97 posts (Oct 2024–present)
│   │   └── scraper_pipeline.md # Scraper architecture & pipeline specification
│   └── audit/
│       └── activity_log.md     # Continuous development & audit log
├── public/                     # Static production assets
│   ├── logo.png                # Authentic DTC circular logo (716x716)
│   ├── favicon.ico             # Multi-resolution browser icon (16, 32, 48)
│   ├── favicon.png             # Club PNG favicon
│   ├── apple-touch-icon.png    # Apple touch icon (180x180)
│   └── media/                  # Optimized video reels, posters, and team visuals
├── src/                        # Next.js 14+ App Router source code
│   ├── app/                    # 5 Core routes (/, /events, /podcast, /gallery, /about)
│   ├── components/             # Mobile-compact, Safari-compliant UI components
│   ├── data/                   # Typed datasets (TEDx, Podcasts, Gallery, Config)
│   └── styles/                 # Tailwind CSS & WebKit hardware-accelerated animations
├── instagram/                  # Master de-duplicated media library
│   ├── events/                 # 8 TEDx MP4 video reels (7× 720x1280 + talk 5 at 360x640), posters, debates, workshops
│   ├── podcasts/               # Let's Talk Podcast YouTube posters, teasers, studio BTS
│   ├── team/                   # Official Mandat 2025–2026 Executive Bureau infographic & retreats
│   ├── awards/                 # Trophy presentations (Flex Dental) & grand stage finale
│   ├── magisterium/            # Magisterium 2026 banners, speaker & lecture posters, keynote, reel poster
│   └── metadata/               # Authentic DTC logo (PNG), 97-post archive & datasets
├── scripts/                    # Media pipeline utilities (legacy retired scrapers in scripts/legacy/)
├── pyproject.toml              # Python pipeline dependencies (uv-managed venv)
├── next.config.mjs             # Static export configuration (output: 'export')
├── graphify-out/               # Knowledge-graph artifacts
│   ├── GRAPH_REPORT.md         # Generated knowledge-graph report
│   └── graph.json              # Structured knowledge-graph data
├── rules.md                    # AI agent guidelines & mandatory update protocols
└── package.json                # Dependencies & deploy scripts (npm run deploy)
```

---

## 🚀 Key Assets & Data Ready for Web Development

1. **Authentic Vector-Quality Logo:** Extracted directly from founding release at [`public/logo.png`](./public/logo.png) (716x716 PNG).
2. **TEDxFMDC 8-Video Reel Archive:** Complete MP4 video reels in [`public/media/events/`](./public/media/events) with speaker topics and poster thumbnails (talks 1–4 and 6–8 captured at 720x1280; talk 5 at 360x640).
3. **Official Mandat 2025–2026 Executive Bureau Infographic:** Preserved in high resolution at [`public/media/team/bureau_executif_2025_2026.jpg`](./public/media/team/bureau_executif_2025_2026.jpg).
4. **Let's Talk Podcast Catalog:** Full dataset of 4 episodes with official stream IDs on [`@LetsTalkPodcast-00`](https://www.youtube.com/@LetsTalkPodcast-00).
5. **Deployment Workflow:** Run `npm run deploy` (`vercel --prod`) — standard server build; Supabase setup once per project (see `docs/platform/deployment.md`).
6. **Knowledge Graph Artifacts:** Generated report and structured data at [`graphify-out/GRAPH_REPORT.md`](./graphify-out/GRAPH_REPORT.md) and [`graphify-out/graph.json`](./graphify-out/graph.json).
