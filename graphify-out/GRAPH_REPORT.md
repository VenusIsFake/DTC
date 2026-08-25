# Graph Report - DTC  (2026-08-25)

## Corpus Check
- Large corpus: 172 files · ~585,468 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 174 nodes · 195 edges · 32 communities (24 shown, 8 thin omitted)
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
- Production Deployment & Faststream Optimization
- Community 11
- Community 12
- Community 13
- Community 27
- Community 28
- Community 30

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `siteConfig` - 10 edges
3. `scripts` - 7 edges
4. `useOverlayDialog()` - 7 edges
5. `DTC Website Platform (Next.js 14)` - 6 edges
6. `TedxTalk` - 5 edges
7. `include` - 5 edges
8. `Dentalk Club FMDC` - 5 edges
9. `VideoPlayerModal()` - 4 edges
10. `GalleryItem` - 4 edges

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

## Communities (32 total, 8 thin omitted)

### Community 0 - "DTC Core Platform & TEDx Video Reels"
Cohesion: 0.10
Nodes (19): lucide-react, dependencies, lucide-react, next, react, react-dom, next, name (+11 more)

### Community 1 - "2025-2026 Executive Bureau Infographic Visual"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 2 - "Podcast Media & Brand Assets"
Cohesion: 0.17
Nodes (9): inter, jakarta, metadata, organizationJsonLd, viewport, Footer(), Navbar(), NavItem (+1 more)

### Community 3 - "Media Organization Engine"
Cohesion: 0.22
Nodes (8): metadata, CategoryFilter, ImageLightbox(), ImageLightboxProps, InfographicViewer(), GalleryItem, galleryItemsData, useOverlayDialog()

### Community 4 - "Instaloader Scraper Pipeline"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+7 more)

### Community 5 - "Instagram Embed Extractor"
Cohesion: 0.25
Nodes (7): Hero(), StatsCounter(), IOSVideo, VideoPlayerModal(), VideoPlayerModalProps, TedxTalk, tedxTalksData

### Community 6 - "Image Labeling & Classification Engine"
Cohesion: 0.28
Nodes (9): Full 97-Post Media Library, Authentic DTC Circular Logo, Dentalk Club FMDC, Bureau Exécutif 2025-2026 Visual, Faculté de Médecine Dentaire de Casablanca, Let's Talk Podcast Series, TEDxFMDC 8-Video Reel Archive, Live Deployment (dentalkclub-fmdc.vercel.app) (+1 more)

### Community 7 - "Root Instagram Reorganizer"
Cohesion: 0.25
Nodes (7): next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 8 - "Authentic Logo Extractor"
Cohesion: 0.36
Nodes (4): metadata, PodcastPlayer(), PodcastEpisode, podcastEpisodesData

## Knowledge Gaps
- **63 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+58 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Instaloader Scraper Pipeline` to `DTC Core Platform & TEDx Video Reels`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `siteConfig` connect `Podcast Media & Brand Assets` to `Media Organization Engine`, `Instagram Embed Extractor`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useOverlayDialog()` connect `Media Organization Engine` to `Instagram Embed Extractor`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _63 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DTC Core Platform & TEDx Video Reels` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `2025-2026 Executive Bureau Infographic Visual` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Instaloader Scraper Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._