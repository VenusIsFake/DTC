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

## 📂 Repository Structure

```text
DTC/
├── docs/                       # Comprehensive documentation hub
│   ├── README.md               # Master documentation index
│   ├── club/
│   │   └── concept.md          # Master club concept, governance hierarchy & events
│   ├── platform/
│   │   ├── architecture.md     # Website technical architecture & component specs
│   │   └── deployment.md       # Fast-push optimizations (<7s), prebuilt workflows, DNS
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
└── package.json                # Dependencies & fast-deploy scripts (npm run fast-deploy)
```

---

## 🚀 Key Assets & Data Ready for Web Development

1. **Authentic Vector-Quality Logo:** Extracted directly from founding release at [`public/logo.png`](./public/logo.png) (716x716 PNG).
2. **TEDxFMDC 8-Video Reel Archive:** Complete MP4 video reels in [`public/media/events/`](./public/media/events) with speaker topics and poster thumbnails (talks 1–4 and 6–8 captured at 720x1280; talk 5 at 360x640).
3. **Official Mandat 2025–2026 Executive Bureau Infographic:** Preserved in high resolution at [`public/media/team/bureau_executif_2025_2026.jpg`](./public/media/team/bureau_executif_2025_2026.jpg).
4. **Let's Talk Podcast Catalog:** Full dataset of 4 episodes with official stream IDs on [`@LetsTalkPodcast-00`](https://www.youtube.com/@LetsTalkPodcast-00).
5. **Instant Deployment Workflow:** Run `npm run fast-deploy` for sub-7s delta deployments to Vercel.
6. **Knowledge Graph Artifacts:** Generated report and structured data at [`graphify-out/GRAPH_REPORT.md`](./graphify-out/GRAPH_REPORT.md) and [`graphify-out/graph.json`](./graphify-out/graph.json).
