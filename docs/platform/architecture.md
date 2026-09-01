# DTC Website — Comprehensive Architecture & Technical Implementation Plan

This document details the full production architecture, routing schema, component design, media delivery pipeline, and styling tokens for the **Dentalk Club FMDC (DTC)** official web platform.

---

## 🏛️ 0. Club Platform Layer (added 2026-08-25)

The site is now a **two-layer platform** (see `docs/platform/club-platform-plan.md` for the approved plan):

1. **Public site** — home, annonces, idées, events/TEDx, podcast, gallery, about — same designs, but content is served from **Supabase** with a static `src/data` fallback when the DB is unreachable.
2. **Backoffice** — Supabase email+password auth (open signup, confirmation off, default role `member`), roles `member → bureau → admin`, and the `/admin` console, open to **bureau + admin** (8 tabs since the 09-01 merge: Utilisateurs* — *admin-only*, Accueil, Annonces & Idées, Podcast Studio, Événements, Galerie, À propos & Commissions, Candidatures; tab persists via `/admin?tab=…`). **Pre-launch site wall** (2026-09-01): middleware serves every path except `/candidature` + `/api/*` to bureau/admin sessions only until the console toggle « Accès public du site » flips `site_wall_open`.

Key architecture points:

* **Next.js server mode** (App Router server components; `output: 'export'` removed) — unlocks dynamic `/events/[slug]`, server-side YouTube import (`POST /api/admin/youtube-import`, bureau+ only), settings-aware nav/sitemap.
* **RLS is the enforcement layer** (`supabase/schema.sql`, hardened v2.4–v2.5 on 2026-09-01): public read for published content **gated by `site_is_open()`** — while the pre-launch site wall is closed (`site_wall_open` = false), anonymous REST reads of public content return nothing and only bureau/admin (or the standalone `/candidature` tables) get data; login-to-interact; votes 1/person by PK with `user_id` hidden from anon; applications anti-abuse (per-campaign dedup on name+phone, 300/hour cap, `profile_id`/`status` pinned by the insert policy); self-profile updates pin `role`/`is_banned`/`email` in the policy itself (two-layer with column grants); contact info only via `bureau_list_profiles()`/`admin_list_profiles()` RPCs (banned members filtered); role/ban changes only via `admin_set_role()`/`admin_set_banned()` security-definer functions; column-level GRANTs keep `profiles` contact fields out of the base table. Advisor WARNs about anon-executable role helpers (`is_admin()` etc.) are accepted by design — anon-side policies call them.
* **Data layer:** `src/lib/data.ts` (server fetchers with fallback), `src/lib/supabase/client.ts` (browser) + `server.ts` (cookies) + session refresh in `src/middleware.ts`.
* **Member surfaces:** `/annonces` (RSVP + headcount + bureau attendee list), `/idees` (pitch/vote/comment + bureau status badges), `/espace` (profile: promo/commission/avatar/bio/phone + "Mes activités" + admin quick panel), `/espace/annuaire` (members-only directory).
* **Content ops:** Podcast Studio (paste-URL YouTube import → auto-filled editor, poster upload), TEDx CRUD + event pages with image uploads and editable items, section visibility (`events_visible` = redirect + nav removal + sitemap exclusion), editable About sections, mandates with member **photos + account links + team import + reorder**, « Accueil » tab editing hero/partners, the site-wall toggle, and (since 2026-09-01) **recruitment campaigns** — open/close a bureau candidature call, positions CRUD, submissions with status/CSV-export/delete, plus the shareable form link; the homepage stats strip was removed the same day (key `home_stats` dormant). Full **account lifecycle** (invite with one-time temp password, reset, delete) via `POST /api/admin/users` — all bureau/admin-managed, zero Supabase-dashboard work (details: `production-readiness.md`).
* **Standalone form portal:** `/candidature` renders outside the site chrome (`SiteChrome` in the root layout drops navbar/footer for that prefix) — Google-Form-like isolation: same DTC identity but `noindex` and **no path into the main website**; anonymous or member submissions (name/phone prefilled, honeypot anti-bot); answers are bureau-only via RLS.
* **Storage buckets:** `avatars` (self-write under `<uid>/`, public read), `club-media` (bureau+ write, images ≤ 25 MB: organigrammes, member photos, posters, gallery, podcasts, events — uploads go through `src/lib/mediaUpload.ts`).

---

## 🎯 1. Tech Stack & Engineering Decisions

* **Framework:** **Next.js 14+ (App Router, server mode)** — server components + client islands; dynamic routes & server-side API calls
* **Backend:** **Supabase** (Postgres + RLS + Auth + Storage) — see §0
* **Language:** **TypeScript** (Strict mode)
* **Styling & Design System:** **Tailwind CSS** + Custom CSS Variables & Glassmorphism with WebKit fallbacks
* **Animations:** Hardware-accelerated CSS Keyframes (`animate-fade-in-up`) for instantaneous initial paint on iOS/Safari without hydration latency
* **Icons:** **Lucide React**
* **Media Players:** 
  * Native HTML5 `<video>` player with custom controls, iOS `webkitEnterFullscreen`, and muted autoplay policy compliance for the 8 TEDx video reels
  * Responsive YouTube iframe embed with `playsinline=1` for *Let's Talk Podcast* (`@LetsTalkPodcast-00`)
* **Image Optimization:** Next.js `<Image unoptimized>` for static edge delivery from `/public/media/`
* **Deployment Pipeline:** Standard Vercel server deployment (`npm run deploy`); Supabase backend (see §0)

---

## 📂 2. Application File Tree & Directory Map

```text
DTC/
├── instagram/                      # Master media library (97-post archive)
│   ├── events/                     # TEDx MP4 video reels (7× 720x1280 + talk 5 at 360x640), poster JPGs, debates, workshops
│   ├── podcasts/                   # Let's Talk Podcast YouTube posters, teasers, studio BTS
│   ├── team/                       # Official Mandat 2025–2026 Executive Bureau infographic & retreats
│   ├── awards/                     # Ceremony & trophies
│   ├── magisterium/                # Magisterium 2026 banners, speaker & lecture posters, keynote, reel poster
│   └── metadata/                   # JSON catalogs (all_posts, tedx_talks, podcasts, summary)
├── docs/                           # Master Documentation Hub
│   ├── README.md                   # Master index & navigation hub
│   ├── club/
│   │   └── concept.md              # Club identity, hierarchy, poles, TEDx & podcasts
│   ├── platform/
│   │   ├── architecture.md         # Technical architecture (this file)
│   │   └── deployment.md           # Server deployment, env vars, Supabase setup, DNS
│   ├── media/
│   │   ├── gallery.md              # Complete media catalog & video specifications
│   │   ├── instagram_data.md       # 97-post timeline analysis & category breakdown
│   │   └── scraper_pipeline.md     # Scraper pipeline & pagination documentation
│   └── audit/
│       └── activity_log.md         # Continuous development log
├── public/                         # Public static web assets
│   ├── logo.png                    # Authentic DTC circular logo (716x716)
│   ├── favicon.ico                 # Multi-resolution club browser icon (16, 32, 48)
│   ├── favicon.png                 # Club PNG favicon
│   ├── apple-touch-icon.png        # iOS Apple touch icon (180x180)
│   └── media/                      # Web-optimized video reels, posters, and team visuals
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root Layout: Navbar, Footer, Meta tags, Font providers
│   │   ├── page.tsx                # Homepage: Hero, Compact Live Counters, TEDx Spotlight, Podcast Feature
│   │   ├── podcast/
│   │   │   └── page.tsx            # Podcast Hub: YouTube Player, Ep. 4 Bouzoubaa, Ep. 3 Sofia Haitami, Ep. 2 Chafii, Ep. 1 Dhaimy
│   │   ├── events/
│   │   │   └── page.tsx            # Events & TEDx: 8 Video Reels Player, Debates, Workshops
│   │   ├── gallery/
│   │   │   └── page.tsx            # Media Gallery: Filterable Masonry Grid with Modal Lightbox
│   │   └── about/
│   │       └── page.tsx            # About DTC: 2025/2026 Bureau Infographic, Founding Story, Sponsors
│   ├── components/
│   │   ├── Navbar.tsx              # Mobile-compact glassmorphic header with active indicator
│   │   ├── Footer.tsx              # Space-efficient footer, links, FMDC affiliation, sponsor credits
│   │   ├── Hero.tsx                # Compact hero without artificial height stretching, instant CSS animations
│   │   ├── StatsCounter.tsx        # Compact 4-metric counter strip with immediate mobile visibility
│   │   ├── VideoPlayerModal.tsx    # Safari-compliant modal player for the TEDx MP4 reels
│   │   ├── PodcastPlayer.tsx       # Embedded YouTube player with episode selector (Ep 1-4)
│   │   ├── InfographicViewer.tsx   # Interactive zoom & pan viewer for 2025/2026 Bureau Visual
│   │   └── ImageLightbox.tsx       # Full-resolution image preview lightbox with tags
│   ├── data/
│   │   ├── siteConfig.ts           # Club metadata, navigation links, and brand colors
│   │   ├── tedxData.ts             # Typed data for all 8 TEDx video reels & speakers
│   │   ├── podcastData.ts          # Typed data for all Let's Talk episodes & YouTube video IDs
│   │   └── galleryData.ts          # Media gallery items mapped by category
│   └── styles/
│       └── globals.css             # Tailwind base styles, WebKit fallbacks, and hardware-accelerated animations
├── next.config.mjs                 # Static export configuration (output: 'export')
├── scripts/                        # Media pipeline utilities (legacy retired scrapers in scripts/legacy/)
├── pyproject.toml                  # Python pipeline dependencies (uv-managed venv)
├── graphify-out/                   # Knowledge-graph artifacts (GRAPH_REPORT.md, graph.json)
├── package.json                    # Dependencies & deploy scripts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 3. Design Tokens & Theme Specification

```typescript
// tailwind.config.ts color tokens
export const colors = {
  dtc: {
    navy: '#0B132B',        // Background canvas & hero base
    navyLight: '#1B2E4B',   // Card background & borders
    steel: '#385A75',       // Secondary surfaces & tags
    gold: '#D4AF37',        // Accent buttons, icons, highlights
    goldLight: '#F59E0B',   // Glowing hover borders & live badges
    white: '#FFFFFF',       // Primary crisp typography
    slate: '#94A3B8',       // Secondary descriptive copy
    darkCard: 'rgba(15, 23, 42, 0.85)' // Glassmorphic background
  }
}
```

---

## 🛠️ 4. Detailed Page-by-Page Specifications

### 1. Homepage (`/`)
* **Hero Banner:**
  * Displays the authentic circular DTC logo (`logo.png`).
  * Headline: *"Dentalk Club FMDC"* — Subhead: *"Let your voice be heard with endless echoes."* 🎙️
  * Compact mobile layout without artificial `min-h-[...]` vertical stretching.
  * Fast CTAs: `[TEDxFMDC]`, `[Podcast]`, `[À Propos]`.
* **Live Statistics Strip:**
  * **1,500+** Community Members & Students Reached
  * **97+** Activities & Milestones Cataloged
  * **8** Landmark TEDx Speaker Talks
  * **4** Let's Talk Podcast Deep-Dives
* **TEDxFMDC Featured Strip:**
  * 3-card preview of popular TEDx reels (Yahia Chemsi *"IA & Humain"*, Aya Jei *"Brain Rot"*, Inès Ben Salah *"Intelligence Émotionnelle"*).
  * Clicking a card opens the instant Safari-compliant video reel player.
* **Podcast Episode 4 Showcase:**
  * Embedded video trailer with Professeur Sidi Mohamed Bouzoubaa.

---

### 2. Events & TEDx Hub (`/events`)
* **TEDxFMDC Section (November 22, 2025):**
  * Amphitheater header image with 3D red "TEDx" letters (`tedx_fmdc_auditorium.jpg`).
  * 8-card grid of all **8 TEDx Video Reels** with speaker cards, talk title, duration, and instant play button.
  * Clicking a talk launches the `VideoPlayerModal` with custom controls and topic takeaways.
* **Débats en Table Dentalk:**
  * Interactive rules breakdown of student parliamentary debates (`debate_table_session.jpg`).
  * Past tournament topics and roundtables (`debate_roundtable.jpg`).
* **Eloquence & Soft Skills Workshops:**
  * Schedule and photos of weekly rhetoric and public speaking drills in Salle Vésale (`eloquence_workshop.jpg`).

---

### 3. Let's Talk Podcast Center (`/podcast`)
* **Featured Broadcaster:**
  * Organic embedded YouTube player with `playsinline=1` for **Episode 4 featuring Professeur Sidi Mohamed Bouzoubaa** (`youtube_id: FXTjMfmNmss`).
  * Episode metadata: Title, Guest background, runtime, recording date, co-production credits (DTC $\times$ Club Social Dentaire), sponsor badge (**Flex Dental**).
* **Interactive Episode Selector:**

  | Episode | Guest | `instagram_post` (IG shortcode) | `youtube_id` |
  | :---: | :--- | :--- | :--- |
  | **Episode 4** | Pr. Sidi Mohamed Bouzoubaa | `DXAEliYDW5w` | `FXTjMfmNmss` |
  | **Episode 3** | Pr. Sofia Haitami | `DQuninFDbRe` | `JoMwnQbmKm0` |
  | **Episode 2** | Pr. Amine Chafii | — | `C1dKfXuC0us` |
  | **Episode 1** | Pr. Said Dhaimy (2-part) | `DHME0jbsZEw` | `njrC04ZxJo0` / `dT1kpZzarEs` |

  > Identifiers are never conflated: `instagram_post` values are Instagram shortcodes (`https://www.instagram.com/p/<shortcode>/`), while `youtube_id` values are YouTube video IDs (`https://www.youtube.com/watch?v=<id>`).
* **Behind-the-Scenes Gallery:**
  * High-res studio viewfinder photos showing hosts and broadcast microphones (`studio_bts_viewfinder.jpg`).

---

### 4. Media Gallery (`/gallery`)
* **Interactive Category Tabs:**
  * `Tous` (All media)
  * `TEDx` (Video reels & amphitheater photos)
  * `Podcast` (Release posters & studio BTS)
  * `Débats` (Debate tables & eloquence workshops)
  * `Club` (Leadership retreats, fellowship)
  * `Trophées` (Ceremonies & awards)
* **Masonry Grid with Lightbox:**
  * Space-efficient 2-column mobile layout with image modal previews (`ImageLightbox`).

---

### 5. About & Governance (`/about`)
* **Founding Heritage:**
  * The story of DTC's inception in November 2024 at FMDC Casablanca.
* **Official 2025/2026 Executive Bureau Infographic:**
  * Prominent showcase of the official visual [`instagram/team/bureau_executif_2025_2026.jpg`](../../instagram/team/bureau_executif_2025_2026.jpg).
  * Interactive zoom & fullscreen inspection component (`InfographicViewer`).
* **5 Functional Poles Breakdown:**
  * Présidence & Stratégie, Coordination & Gestion, Médias & Identité Visuelle, Logistique Événementielle, Pôles Linguistiques.
* **Faculty Mentorship & Partners:**
  * Sponsor spotlight: **Flex Dental**.
  * Partner student organization: **Club Social Dentaire (CSD)**.

---

## ⚡ 5. Build & Deploy Commands

```bash
# 1. Local development server
npm run dev

# 2. Local typecheck, lint & production build verification
npm run build
npm run lint

# 3. Production deployment (standard server build)
npm run deploy
```

Supabase setup (schema + seed + auth + admin bootstrap) is documented in `docs/platform/deployment.md`.
