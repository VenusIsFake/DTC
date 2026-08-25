# DTC Website — Comprehensive Architecture & Technical Implementation Plan

This document details the full production architecture, routing schema, component design, media delivery pipeline, and styling tokens for the **Dentalk Club FMDC (DTC)** official web platform.

---

## 🎯 1. Tech Stack & Engineering Decisions

* **Framework:** **Next.js 14+ (App Router)** with Static HTML Export (`output: 'export'`) for sub-50ms Edge delivery
* **Language:** **TypeScript** (Strict mode)
* **Styling & Design System:** **Tailwind CSS** + Custom CSS Variables & Glassmorphism with WebKit fallbacks
* **Animations:** Hardware-accelerated CSS Keyframes (`animate-fade-in-up`) for instantaneous initial paint on iOS/Safari without hydration latency
* **Icons:** **Lucide React**
* **Media Players:** 
  * Native HTML5 `<video>` player with custom controls, iOS `webkitEnterFullscreen`, and muted autoplay policy compliance for the 8 TEDx video reels
  * Responsive YouTube iframe embed with `playsinline=1` for *Let's Talk Podcast* (`@LetsTalkPodcast-00`)
* **Image Optimization:** Next.js `<Image unoptimized>` for static edge delivery from `/public/media/`
* **Deployment Pipeline:** Vercel Prebuilt Deployments (`npm run fast-deploy`) delivering sub-7s delta updates

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
│   │   └── deployment.md           # Fast-push optimizations (<7s), prebuilt workflows, DNS
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
├── package.json                    # Dependencies & fast-deploy scripts
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

## ⚡ 5. Deployment & Fast-Push CLI Commands

```bash
# 1. Local development server
npm run dev

# 2. Local typecheck & static build verification
npm run build

# 3. Instant Prebuilt Production Deployment (< 7s)
npm run fast-deploy
```
