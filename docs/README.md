# 🏛️ DTC (Dentalk Club FMDC) — Master Documentation Hub

Welcome to the central documentation and architecture repository for **Dentalk Club FMDC (DTC)** at the *Faculté de Médecine Dentaire de Casablanca* (Université Hassan II de Casablanca).

---

## 📂 Organized Documentation Structure

```text
docs/
├── README.md                      # 📖 Master Documentation Hub & Index (this file)
│
├── club/                          # 🏛️ Club Identity, Governance & Mission
│   └── concept.md                 # Mission, 2025/2026 Executive Bureau hierarchy, 5 poles, TEDx & podcasts
│
├── platform/                      # 💻 Web Platform Engineering & Deployment
│   ├── architecture.md            # Next.js 14+ App Router, club platform layer (Supabase/RLS), component specs
│   ├── club-platform-plan.md      # 🚀 Approved plan & handoff: auth/roles, backoffice, Supabase (IMPLEMENTED 2026-08-25)
│   ├── production-readiness.md    # 🎛️ 2026-08/09 console sweep: mandat photos/accounts, Accueil tab, uploads, key badges
│   └── deployment.md              # Server deployment, env vars, Supabase setup checklist, DNS
│
├── media/                         # 📸 Digital Media Archives & Scraper Engine
│   ├── gallery.md                 # Complete catalog of 8 TEDx video reels, podcast posters, team visuals
│   ├── instagram_data.md          # 97-post archive analysis & timeline breakdown (Oct 2024 to present)
│   └── scraper_pipeline.md        # Chrome session extraction, authenticated API pagination & schemas
│
└── audit/                         # 📜 Project History & Audit Trails
    └── activity_log.md            # Continuous chronological development log
```

---

## 📋 Comprehensive Category Index

### 1. 🏛️ Club Governance & Identity
* **[docs/club/concept.md](club/concept.md)**
  * **Core Mission & Vision:** Foundation history (Nov 2024), eloquence and medical communication philosophy.
  * **2025/2026 Executive Bureau:** Mermaid hierarchy diagram of the 12-member bureau led by President Hatim El Guerraoui.
  * **5 Functional Poles:** Présidence, Coordination, Médias, Logistique, Pôles Linguistiques (FR, ANG, AR).
  * **Flagship Events:** TEDxFMDC 8-talk breakdown, Let's Talk Podcast series (`@LetsTalkPodcast-00`), parliamentary debate tables, and soft skills workshops.
  * **Brand Identity:** Authentic circular DTC logo badge, prestige gold/navy palette, and sponsor recognition (**Flex Dental**).

---

### 2. 💻 Web Platform Engineering
* **[docs/platform/architecture.md](platform/architecture.md)**
  * **Next.js 14+ App Router Architecture:** Static HTML export (`output: 'export'`), 5 core routes (`/`, `/events`, `/podcast`, `/gallery`, `/about`).
  * **iOS / Safari Compatibility Remediation:** Hardware-accelerated CSS animations (`@keyframes fadeInSlideUp`) resolving initial SSR opacity-0 glitches, WebKit scrolling stability, and native iOS `webkitEnterFullscreen()`.
  * **Mobile Space-Efficiency:** Compact hero headers, elimination of vertical empty spaces, and 2-column mobile layouts.
  * **Component Breakdown:** `Navbar`, `Footer`, `Hero`, `StatsCounter`, `VideoPlayerModal`, `PodcastPlayer`, `InfographicViewer`, `ImageLightbox`.
* **[docs/platform/club-platform-plan.md](platform/club-platform-plan.md)**
  * **Approved & implemented 2026-08-25:** full club-platform plan — Supabase auth/roles (member/bureau/admin), announcements + RSVP, idea pitching/votes/comments, member space & annuaire, Podcast Studio (paste-URL YouTube import), events visibility & `/events/[slug]` creator, fully-editable About with mandate archives.
  * **Architecture switch:** static export → standard Vercel server deployment (`vercel --prod`); RLS is the enforcement layer; static fallback for resilience. Includes the settled-decisions log, execution order, and Supabase MCP status/quirks for the implementing session.
* **[docs/platform/production-readiness.md](platform/production-readiness.md)**
  * **Console production-readiness sweep (2026-08-31/09-01):** mandat member photos + account linking + one-click team import, console open to the bureau role, « Accueil » tab (marquee/slogan/stats/partners via `site_settings`), real podcast posters, console image uploads everywhere, full account lifecycle (invite / temp passwords / delete) with the server-only service-role key, key-missing badges, shared upload helper.
* **[docs/platform/deployment.md](platform/deployment.md)**
  * **Deployment & Supabase Setup:** Server deployment (`npm run deploy` = `vercel --prod`), env vars (`NEXT_PUBLIC_SUPABASE_URL`/key, server-only `YOUTUBE_API_KEY`), Supabase schema/seed application, auth settings, admin bootstrap, domains.
  * **Production Domains & DNS:** `https://dentalkclub-fmdc.vercel.app` & `https://dtc-fmdc.vercel.app`.
  * **Vercel Settings & SSO Configuration:** Public access enabled with zero login walls.

---

### 3. 📸 Media Archives & Data Pipeline
* **[docs/media/gallery.md](media/gallery.md)**
  * **TEDxFMDC 8-Video Reel Catalog:** Complete table of 8 MP4 video reels (7× 720x1280; talk 5 at 360x640), speaker names, topics, and durations.
  * **Let's Talk Podcast Archive:** Episode 4 (Pr. Sidi Mohamed Bouzoubaa), Ep. 3 (Pr. Sofia Haitami), Ep. 2 (Pr. Amine Chafii), Ep. 1 (Pr. Said Dhaimy), and studio BTS viewfinders.
  * **Team Visuals:** Official 2025/2026 Executive Bureau visual (`DLDCuK1tg_i`).
* **[docs/media/instagram_data.md](media/instagram_data.md)**
  * **Timeline Analysis:** Categorized breakdown of all 97 posts from October 2024 to present across 4 major activity pillars.
* **[docs/media/scraper_pipeline.md](media/scraper_pipeline.md)**
  * **Automated Scraper Engine:** Chrome cookie session extraction (`browser_cookie3`), authenticated API pagination scripts, rate-limit bypassing, and JSON metadata schemas.

---

### 4. 📜 Audit & History Tracking
* **[docs/audit/activity_log.md](audit/activity_log.md)**
  * **Continuous Chronological Audit:** Complete, timestamped log of all codebase actions, media extractions, iOS bug remediation, and deployments.

---

## 🌐 Live Production Links
* **Primary Branded Domain:** **[https://dentalkclub-fmdc.vercel.app](https://dentalkclub-fmdc.vercel.app)**
* **Short Domain Alias:** **[https://dtc-fmdc.vercel.app](https://dtc-fmdc.vercel.app)**
* **Official YouTube Channel:** **[`@LetsTalkPodcast-00`](https://www.youtube.com/@LetsTalkPodcast-00)**
* **Official Instagram:** **[`@dentalkclub_fmdc`](https://www.instagram.com/dentalkclub_fmdc/)**
* **Knowledge Graph Artifacts:** **[`graphify-out/GRAPH_REPORT.md`](../graphify-out/GRAPH_REPORT.md)**
