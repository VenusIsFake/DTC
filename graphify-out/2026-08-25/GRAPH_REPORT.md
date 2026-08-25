# Graph Report - DTC  (2026-08-25)

## Corpus Check
- Large corpus: 163 files · ~583,135 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 160 nodes · 177 edges · 27 communities (22 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 2,400 input · 1,300 output

## Community Hubs (Navigation)
- DTC Core Platform & TEDx Video Reels
- 2025-2026 Executive Bureau Infographic Visual
- Podcast Media & Brand Assets
- Media Organization Engine
- Instaloader Scraper Pipeline
- Instagram Embed Extractor
- Image Labeling & Classification Engine
- Root Instagram Reorganizer
- Authentic Logo Extractor
- TEDx Video Reel Downloader
- Persistent Invariants & Verified Production Release
- Community 11
- Community 12
- Community 24

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `siteConfig` - 8 edges
3. `scripts` - 7 edges
4. `DTC Website Platform (Next.js 14)` - 6 edges
5. `TedxTalk` - 5 edges
6. `include` - 5 edges
7. `Dentalk Club FMDC` - 5 edges
8. `GalleryItem` - 4 edges
9. `lib` - 4 edges
10. `VideoPlayerModal()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Dentalk Club FMDC` --BRANDED_BY--> `Authentic DTC Circular Logo`  [EXTRACTED]
  docs/club/concept.md → instagram/metadata/dtc_logo.png
- `Dentalk Club FMDC` --GOVERNED_BY--> `Bureau Exécutif 2025-2026 Visual`  [EXTRACTED]
  docs/club/concept.md → instagram/team/bureau_executif_2025_2026.jpg
- `Dentalk Club FMDC` --ORGANIZED--> `TEDxFMDC 8-Video Reel Archive`  [EXTRACTED]
  docs/club/concept.md → instagram/metadata/tedx_talks.json
- `DTC Website Platform (Next.js 14)` --SHOWCASES_HIERARCHY_VISUAL--> `Bureau Exécutif 2025-2026 Visual`  [EXTRACTED]
  docs/platform/architecture.md → instagram/team/bureau_executif_2025_2026.jpg
- `DTC Website Platform (Next.js 14)` --PLAYS_VIDEO_REELS_OF--> `TEDxFMDC 8-Video Reel Archive`  [EXTRACTED]
  docs/platform/architecture.md → instagram/metadata/tedx_talks.json

## Import Cycles
- None detected.

## Communities (27 total, 5 thin omitted)

### Community 0 - "DTC Core Platform & TEDx Video Reels"
Cohesion: 0.08
Nodes (25): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+17 more)

### Community 1 - "2025-2026 Executive Bureau Infographic Visual"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 2 - "Podcast Media & Brand Assets"
Cohesion: 0.20
Nodes (9): inter, jakarta, metadata, Footer(), Hero(), Navbar(), StatsCounter(), NavItem (+1 more)

### Community 3 - "Media Organization Engine"
Cohesion: 0.12
Nodes (17): clsx, framer-motion, lucide-react, dependencies, clsx, framer-motion, lucide-react, next (+9 more)

### Community 4 - "Instaloader Scraper Pipeline"
Cohesion: 0.28
Nodes (9): Full 97-Post Media Library, Authentic DTC Circular Logo, Dentalk Club FMDC, Bureau Exécutif 2025-2026 Visual, Faculté de Médecine Dentaire de Casablanca, Let's Talk Podcast Series, TEDxFMDC 8-Video Reel Archive, Live Deployment (dentalkclub-fmdc.vercel.app) (+1 more)

### Community 5 - "Instagram Embed Extractor"
Cohesion: 0.39
Nodes (5): CategoryFilter, ImageLightbox(), ImageLightboxProps, GalleryItem, galleryItemsData

### Community 6 - "Image Labeling & Classification Engine"
Cohesion: 0.25
Nodes (7): next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 7 - "Root Instagram Reorganizer"
Cohesion: 0.46
Nodes (4): VideoPlayerModal(), VideoPlayerModalProps, TedxTalk, tedxTalksData

### Community 8 - "Authentic Logo Extractor"
Cohesion: 0.36
Nodes (4): metadata, PodcastPlayer(), PodcastEpisode, podcastEpisodesData

## Knowledge Gaps
- **60 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Media Organization Engine` to `DTC Core Platform & TEDx Video Reels`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `2025-2026 Executive Bureau Infographic Visual` to `Image Labeling & Classification Engine`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DTC Core Platform & TEDx Video Reels` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `2025-2026 Executive Bureau Infographic Visual` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Media Organization Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._