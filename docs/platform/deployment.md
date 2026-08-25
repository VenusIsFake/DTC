# DTC Platform — Deployment & Supabase Setup Guide

The club platform runs as a **standard Next.js server deployment on Vercel** (App Router, server components) with **Supabase** (Postgres + RLS + Auth + Storage) as its backend. The old static-export / `fast-deploy` flow was retired with the platform migration (2026-08-25) — this file now documents the current pipeline and the one-time setup checklist.

---

## 🚀 1. Deploy

```bash
npm run deploy        # = vercel --prod --yes
```

Or push to `main` on GitHub and let Vercel's Git integration build it. All routes are server-rendered on demand (`ƒ`), so there is no prerendered bundle to optimize anymore. The Vercel project must expose the env vars in §2, otherwise the site gracefully falls back to the static `src/data` content and the member features stay hidden.

> **The dev (VenusIsFake) deploys — agents never deploy without asking.**

---

## 🔑 2. Environment Variables

Set in `.env.local` (dev) and Vercel → Project → Settings → Environment Variables (prod):

| Variable | Where it comes from | Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — both names accepted)* | Same screen (new projects call it "publishable key", `sb_pub_…`) | client + server |
| `YOUTUBE_API_KEY` | Google Cloud → enable **YouTube Data API v3** → create/restrict key | **server only** (never `NEXT_PUBLIC_`) |

A template lives in `.env.example`. Never commit `.env*` (git-ignored).

---

## 🗄️ 3. One-time Supabase project setup

1. **Create the project** on the free tier at supabase.com.
2. **Apply the schema:** SQL Editor → paste & run `supabase/schema.sql` (tables, RLS policies, security-definer RPCs, views, storage buckets, default settings).
3. **Seed content:** SQL Editor → paste & run `supabase/seed.sql` (5 commissions, Mandat 2025–2026 + 12 members, 4 podcast episodes, 8 TEDx talks, 3 "À propos" sections). Mirrors the static `src/data` files so the DB-driven site renders identically to the old static site on day one.
4. **Auth settings:** Authentication → Providers → Email: **disable "Confirm email"**. Authentication → URL Configuration → Site URL: `https://dentalkclub-fmdc.vercel.app`.
   **Recommended security toggles** (Authentication → Sign In / Up — these two are dashboard-only, the Management API ignores them):
   - **Leaked password protection: ON** (rejects passwords found in known breaches)
   - **Minimum password length: 8** (the signup form already enforces 8 client-side; the server default is 6 until this is flipped)
5. **Bootstrap the first admin:** sign up in the app, then in the SQL editor run:
   ```sql
   update profiles set role = 'admin' where email = 'your-email@example.com';
   ```
   Promote the president to `bureau`/`admin` afterwards from the console (`/admin` → Utilisateurs).

---

## 🌐 4. Live Domains & Vercel Settings

| Domain Type | Live URL |
| :--- | :--- |
| **Primary Production Domain** | **https://dentalkclub-fmdc.vercel.app** |
| **Short Domain Alias** | https://dtc-fmdc.vercel.app |
| **Direct Project URL** | https://dtc-lilac.vercel.app |

* **Project:** `dtc` (team `venus55`), Next.js preset, no SSO protection.
* **`.vercelignore`** still excludes `.venv/`, `scripts/`, `docs/`, `graphify-out/`, `instagram/`, `rules.md`, `overview.md`, and now `supabase/`.
* **Security headers + CSP** come from `vercel.json`; `connect-src` allows `https://*.supabase.co wss://*.supabase.co`, `img-src` allows `i.ytimg.com` + Supabase storage.

---

## 🧠 5. Architecture Notes for Deployers

* **RLS is the enforcement layer.** The `/admin` console is a hidden route guarded server-side by role + by Postgres RLS for the data itself. Public pages read published content; drafts are invisible outside the bureau.
* **Static fallback:** every public page tries the database first and falls back to the static `src/data` seeds if Supabase is unreachable or the env vars are missing — the site can never blank out.
* **Session refresh** runs in `src/middleware.ts` (official Supabase pattern), keeping server components' cookies fresh.
* **Media:** the 82 MB of TEDx MP4s still ship from `public/media` (see `docs/media/gallery.md` for the offload roadmap); avatars and mandate infographics live in Supabase Storage buckets `avatars` / `club-media`.
