# Graph Report - DTC  (2026-08-25)

## Corpus Check
- 101 files · ~87,913 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 444 nodes · 902 edges · 42 communities (33 shown, 9 thin omitted)
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
- EventsTab.tsx
- 🎤 3. Key Milestone Archive
- fetch_all_posts.py
- events/layout.tsx
- gallery/layout.tsx
- next.config.mjs
- next-env.d.ts
- tailwind.config.ts
- vercel.json
- dtc-media-pipeline
- 🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff
- Instagram Scraper & Synchronization Pipeline: Dentalk Club FMDC
- AI Agent Operational Rules & Guidelines for DTC Website
- extends
- Dentalk Club FMDC (DTC) — Project Overview
- README.md
- DTC Project Activity Log
- 📋 Comprehensive Category Index

## God Nodes (most connected - your core abstractions)
1. `getSupabaseBrowserClient()` - 41 edges
2. `useOverlayDialog()` - 22 edges
3. `useAuth()` - 21 edges
4. `createSupabaseServerClient()` - 18 edges
5. `isSupabaseConfigured()` - 17 edges
6. `formatRelative()` - 16 edges
7. `compilerOptions` - 16 edges
8. `getSiteSettings()` - 15 edges
9. `inputClass` - 12 edges
10. `withFallback()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `DTC Website Platform (Next.js 14)` --EMBEDS_EPISODES_OF--> `Let's Talk Podcast Series`  [EXTRACTED]
  docs/platform/architecture.md → src/data/podcastData.ts
- `RootLayout()` --calls--> `getSiteSettings()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/data.ts
- `SectionsEditor()` --calls--> `getSupabaseBrowserClient()`  [EXTRACTED]
  src/components/admin/AboutTab.tsx → src/lib/supabase/client.ts
- `StatsEditor()` --calls--> `getSupabaseBrowserClient()`  [EXTRACTED]
  src/components/admin/AboutTab.tsx → src/lib/supabase/client.ts
- `CommitteesEditor()` --calls--> `getSupabaseBrowserClient()`  [EXTRACTED]
  src/components/admin/CommitteesTab.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (42 total, 9 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.05
Nodes (41): autoprefixer, eslint, eslint-config-next, lucide-react, dependencies, lucide-react, next, react (+33 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 2 - "app/layout.tsx"
Cohesion: 0.07
Nodes (31): AnnoncesPage(), metadata, inter, jakarta, metadata, organizationJsonLd, RootLayout(), viewport (+23 more)

### Community 3 - "useOverlayDialog"
Cohesion: 0.13
Nodes (17): dynamic, isoDurationToClock(), POST(), YouTubeVideoResponse, CategoryFilter, EditorModal(), AuthModal(), Mode (+9 more)

### Community 4 - "types.ts"
Cohesion: 0.08
Nodes (55): MandatesEditor(), AnnouncementsTab(), IdeasTab(), STATUS_LABELS, ROLE_LABELS, UsersTab(), AnnouncementsFeed(), Attendee (+47 more)

### Community 5 - "data.ts"
Cohesion: 0.08
Nodes (43): AboutPage(), metadata, AdminPage(), dynamic, metadata, AnnuairePage(), dynamic, metadata (+35 more)

### Community 6 - "DTC Website Platform (Next.js 14)"
Cohesion: 0.33
Nodes (6): Full 97-Post Media Library, Dentalk Club FMDC, Faculté de Médecine Dentaire de Casablanca, Let's Talk Podcast Series, Live Deployment (dentalkclub-fmdc.vercel.app), DTC Website Platform (Next.js 14)

### Community 7 - "EventsTab.tsx"
Cohesion: 0.09
Nodes (36): AboutTab(), SectionsEditor(), StatsEditor(), AdminConsole(), TabId, TABS, STATUS_LABELS, CommitteesEditor() (+28 more)

### Community 8 - "🎤 3. Key Milestone Archive"
Cohesion: 0.20
Nodes (9): 📊 1. Account & Timeline Overview, 📈 2. Category & Event Breakdown across 97 Posts, 🎤 3. Key Milestone Archive, Instagram Data & Content Analysis: Dentalk Club FMDC, 📂 Master Metadata Location, Milestone 1: Founding & Inception (October – November 2024), Milestone 2: TEDxFMDC First Edition (November 22, 2025), Milestone 3: Let's Talk Podcast Series (2025–2026) (+1 more)

### Community 32 - "🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff"
Cohesion: 0.15
Nodes (13): 10. Supabase MCP — status & known quirks, 11. Out of scope v1 (roadmap only), 1. The vision, 2. Current state of the repo (verify before executing), 3. Architecture (settled), 4. Settled decisions (from the dev Q&A — do not reopen), 5. Database design (`supabase/schema.sql` + `supabase/seed.sql`), 6. Frontend plan (French UI, existing idiom, mobile-first, iOS-safe) (+5 more)

### Community 33 - "Instagram Scraper & Synchronization Pipeline: Dentalk Club FMDC"
Cohesion: 0.20
Nodes (9): 🛠️ 1. Architecture Overview, 🔑 2. Authentication & Rate-Limit Bypassing, 📂 3. Utility Scripts Roster, 📋 4. JSON Data Schemas, Active scripts (`scripts/`), Instagram Scraper & Synchronization Pipeline: Dentalk Club FMDC, Podcast Episode Object (`podcasts_catalog.json`):, Retired legacy scripts (`scripts/legacy/`) — target the deleted `data/` tree (+1 more)

### Community 34 - "AI Agent Operational Rules & Guidelines for DTC Website"
Cohesion: 0.18
Nodes (10): 1. Core Principles & Philosophy, 2. Environment & Tooling Conventions, 3. Instagram & Media Scraping Rules, 4. Documentation & Knowledge Graph Conventions, 5. WebKit & iOS Safari Compatibility Invariants, 6. Mobile Space-Efficiency Standards, 7. Next.js Deployment Mode & Server Platform, 8. Media Player & Interactive Lifecycle Rules (+2 more)

### Community 37 - "Dentalk Club FMDC (DTC) — Project Overview"
Cohesion: 0.29
Nodes (6): 🎯 About Dentalk Club FMDC, 🏛️ Club Platform Layer (2026-08-25), Dentalk Club FMDC (DTC) — Project Overview, 🚀 Key Assets & Data Ready for Web Development, 🌐 Live Production Platform & DNS, 📂 Repository Structure

### Community 39 - "README.md"
Cohesion: 0.33
Nodes (3): 🏛️ DTC (Dentalk Club FMDC) — Master Documentation Hub, 🌐 Live Production Links, 📂 Organized Documentation Structure

### Community 40 - "DTC Project Activity Log"
Cohesion: 0.33
Nodes (6): 2026-08-24, 2026-08-25 — Club platform implementation (phases A–D, full build), 2026-08-25 — Club platform planning session (no code changes), 2026-08-25 — Independent judge audit + remediation, 2026-08-25 — Production-readiness audit & remediation, DTC Project Activity Log

### Community 41 - "📋 Comprehensive Category Index"
Cohesion: 0.40
Nodes (5): 1. 🏛️ Club Governance & Identity, 2. 💻 Web Platform Engineering, 3. 📸 Media Archives & Data Pipeline, 4. 📜 Audit & History Tracking, 📋 Comprehensive Category Index

## Knowledge Gaps
- **157 isolated node(s):** `next/core-web-vitals`, `nextConfig`, `name`, `version`, `private` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseBrowserClient()` connect `types.ts` to `useOverlayDialog`, `data.ts`, `EventsTab.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useOverlayDialog()` connect `useOverlayDialog` to `app/layout.tsx`, `types.ts`, `EventsTab.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `isSupabaseConfigured()` connect `data.ts` to `types.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `nextConfig`, `name` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `app/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0726950354609929 - nodes in this community are weakly interconnected._