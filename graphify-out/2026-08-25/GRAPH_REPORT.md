# Graph Report - DTC  (2026-08-25)

## Corpus Check
- 101 files · ~87,310 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 443 nodes · 892 edges · 39 communities (30 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4893c095`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- compilerOptions
- app/layout.tsx
- useOverlayDialog
- types.ts
- data.ts
- DTC Website Platform (Next.js 14)
- useAuth
- AnnouncementsFeed.tsx
- fetch_all_posts.py
- events/layout.tsx
- gallery/layout.tsx
- next.config.mjs
- next-env.d.ts
- tailwind.config.ts
- vercel.json
- dtc-media-pipeline
- 🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff
- src/middleware.ts
- AI Agent Operational Rules & Guidelines for DTC Website
- extends
- Dentalk Club FMDC (DTC) — Project Overview

## God Nodes (most connected - your core abstractions)
1. `getSupabaseBrowserClient()` - 41 edges
2. `useOverlayDialog()` - 22 edges
3. `createSupabaseServerClient()` - 18 edges
4. `useAuth()` - 17 edges
5. `formatRelative()` - 16 edges
6. `compilerOptions` - 16 edges
7. `getSiteSettings()` - 15 edges
8. `isSupabaseConfigured()` - 15 edges
9. `inputClass` - 12 edges
10. `withFallback()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `DTC Website Platform (Next.js 14)` --EMBEDS_EPISODES_OF--> `Let's Talk Podcast Series`  [EXTRACTED]
  docs/platform/architecture.md → src/data/podcastData.ts
- `AnnoncesPage()` --calls--> `getPublishedAnnouncements()`  [EXTRACTED]
  src/app/annonces/page.tsx → src/lib/data.ts
- `generateMetadata()` --calls--> `getEventPage()`  [EXTRACTED]
  src/app/events/[slug]/page.tsx → src/lib/data.ts
- `RootLayout()` --calls--> `getSiteSettings()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/data.ts
- `POST()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/api/admin/youtube-import/route.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (39 total, 9 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.05
Nodes (41): autoprefixer, eslint, eslint-config-next, lucide-react, dependencies, lucide-react, next, react (+33 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 2 - "app/layout.tsx"
Cohesion: 0.18
Nodes (11): inter, jakarta, metadata, organizationJsonLd, RootLayout(), viewport, AuthProvider(), Footer() (+3 more)

### Community 3 - "useOverlayDialog"
Cohesion: 0.12
Nodes (19): dynamic, isoDurationToClock(), POST(), YouTubeVideoResponse, generateMetadata(), Params, CategoryFilter, EditorModal() (+11 more)

### Community 4 - "types.ts"
Cohesion: 0.06
Nodes (70): AboutTab(), MandatesEditor(), SectionsEditor(), StatsEditor(), TabId, TABS, AnnouncementsTab(), STATUS_LABELS (+62 more)

### Community 5 - "data.ts"
Cohesion: 0.08
Nodes (43): AboutPage(), metadata, EventsPage(), EventLandingPage(), IdeesPage(), metadata, HomePage(), metadata (+35 more)

### Community 6 - "DTC Website Platform (Next.js 14)"
Cohesion: 0.33
Nodes (6): Full 97-Post Media Library, Dentalk Club FMDC, Faculté de Médecine Dentaire de Casablanca, Let's Talk Podcast Series, Live Deployment (dentalkclub-fmdc.vercel.app), DTC Website Platform (Next.js 14)

### Community 7 - "useAuth"
Cohesion: 0.13
Nodes (20): AdminPage(), dynamic, metadata, AnnuairePage(), dynamic, metadata, dynamic, EspacePage() (+12 more)

### Community 8 - "AnnouncementsFeed.tsx"
Cohesion: 0.15
Nodes (16): AnnoncesPage(), metadata, AnnouncementsFeed(), Attendee, AttendeesModal(), STATUS_LABELS, STATUS_TONES, NextAtelierTeaser() (+8 more)

### Community 32 - "🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff"
Cohesion: 0.04
Nodes (44): 2026-08-24, 2026-08-25 — Club platform implementation (phases A–D, full build), 2026-08-25 — Club platform planning session (no code changes), 2026-08-25 — Production-readiness audit & remediation, DTC Project Activity Log, 📊 1. Account & Timeline Overview, 📈 2. Category & Event Breakdown across 97 Posts, 🎤 3. Key Milestone Archive (+36 more)

### Community 33 - "src/middleware.ts"
Cohesion: 0.47
Nodes (3): config, middleware(), updateSession()

### Community 34 - "AI Agent Operational Rules & Guidelines for DTC Website"
Cohesion: 0.18
Nodes (10): 1. Core Principles & Philosophy, 2. Environment & Tooling Conventions, 3. Instagram & Media Scraping Rules, 4. Documentation & Knowledge Graph Conventions, 5. WebKit & iOS Safari Compatibility Invariants, 6. Mobile Space-Efficiency Standards, 7. Next.js Deployment Mode & Server Platform, 8. Media Player & Interactive Lifecycle Rules (+2 more)

### Community 37 - "Dentalk Club FMDC (DTC) — Project Overview"
Cohesion: 0.29
Nodes (6): 🎯 About Dentalk Club FMDC, 🏛️ Club Platform Layer (2026-08-25), Dentalk Club FMDC (DTC) — Project Overview, 🚀 Key Assets & Data Ready for Web Development, 🌐 Live Production Platform & DNS, 📂 Repository Structure

## Knowledge Gaps
- **156 isolated node(s):** `next/core-web-vitals`, `nextConfig`, `name`, `version`, `private` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseBrowserClient()` connect `types.ts` to `app/layout.tsx`, `useOverlayDialog`, `data.ts`, `useAuth`, `AnnouncementsFeed.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useOverlayDialog()` connect `useOverlayDialog` to `AnnouncementsFeed.tsx`, `types.ts`, `data.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `isSupabaseConfigured()` connect `useAuth` to `app/layout.tsx`, `types.ts`, `data.ts`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `nextConfig`, `name` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `useOverlayDialog` be split into smaller, more focused modules?**
  _Cohesion score 0.11576354679802955 - nodes in this community are weakly interconnected._