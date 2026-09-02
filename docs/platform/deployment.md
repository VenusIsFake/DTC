# DTC Platform — Deployment & Supabase Setup Guide

The club platform runs as a **standard Next.js server deployment on Vercel** (App Router, server components) with **Supabase** (Postgres + RLS + Auth + Storage) as its backend. The old static-export / `fast-deploy` flow was retired with the platform migration (2026-08-25) — this file now documents the current pipeline and the one-time setup checklist.

---

## 🚀 1. Deploy

```bash
npm run deploy        # = vercel --prod --yes
```

Deploy with the CLI. ⚠️ **`git push` does NOT trigger a deployment** (verified 2026-09-01: the Vercel Git integration is not auto-building this repo — every production deployment on record came from the CLI). Pushing only updates GitHub; shipping requires `npm run deploy` from a **clean tree** (CLI ships the working directory, so uncommitted WIP would go out with it). Confirm deploy freshness via `vercel ls` (deployment age), never via headers Vercel injects itself (e.g. HSTS is added by Vercel regardless of `vercel.json`). All routes are server-rendered on demand (`ƒ`), so there is no prerendered bundle to optimize anymore. The Vercel project must expose the env vars in §2, otherwise the site gracefully falls back to the static `src/data` content and the member features stay hidden.

> **The dev (VenusIsFake) deploys — agents never deploy without asking.**

---

## 🔑 2. Environment Variables

Set in `.env.local` (dev) and Vercel → Project → Settings → Environment Variables (prod):

| Variable | Where it comes from | Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — both names accepted)* | Same screen (new projects call it "publishable key", `sb_pub_…`) | client + server |
| `YOUTUBE_API_KEY` | Google Cloud → enable **YouTube Data API v3** → create/restrict key | **server only** (never `NEXT_PUBLIC_`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secret) | **server only** — console account lifecycle (`POST /api/admin/users`); optional but recommended (console shows a badge while missing) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | *(optional)* Cloudflare Turnstile site key — see §6 Captcha | client |
| `RESEND_API_KEY` + `EMAIL_FROM` + `NEXT_PUBLIC_SITE_URL` | *(optional)* Resend account — see §6 Email | server |

A template lives in `.env.example`. Never commit `.env*` (git-ignored).

---

## 🔐 6. Optional integrations (dormant until configured)

All three ship in the code but stay **invisible/inactive without their env vars** — no error, no UI change:

**Captcha (Turnstile)** — anti-bot on sign-in/sign-up:
1. Cloudflare dashboard → Turnstile → *Add site* → copy the **site key** (public) and **secret key**.
2. Supabase → Authentication → Sign In / Up → **Captcha** → paste the **secret key**, enable.
3. Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to `.env.local` + Vercel (Production). The widget then appears in the auth modal automatically; the CSP already allows `challenges.cloudflare.com`.

**Email broadcast (Resend)** — "Notifier par email" button on published announcements (console → Annonces):
1. Create a free account at resend.com → API Keys → create a key.
2. Verify a sending domain (Settings → Domains), or keep the default `onboarding@resend.dev` for testing (100 emails/day, enough for the club).
3. Set `RESEND_API_KEY`, `EMAIL_FROM` (e.g. `Dentalk Club FMDC <noreply@votre-domaine.ma>`) and `NEXT_PUBLIC_SITE_URL` in `.env.local` + Vercel. The button sends to all member emails in BCC batches of 50; without the key it returns a clear French 503 with instructions.

**Weekly DB backups (GitHub Actions)** — `.github/workflows/backup-db.yml`:
1. Supabase → Connect → copy the **Session pooler** connection string (port 5432, `…pooler.supabase.com` — session mode; the direct `db.*` host is IPv6-only and unreachable from GitHub runners).
2. GitHub repo → Settings → Secrets and variables → Actions → new secret `SUPABASE_DB_URL` (string includes the password).
3. Runs Sundays 02:00 UTC + manual "Run workflow" button; dumps land as Actions artifacts (90-day retention, collaborators-only download).

**CI (GitHub Actions)** — `.github/workflows/ci.yml` runs `tsc --noEmit` + lint + vitest + `next build` on every push/PR to `main`. No secrets needed: the build must pass without env vars (static-fallback contract).

---

## 🗄️ 3. One-time Supabase project setup

1. **Create the project** on the free tier at supabase.com.
2. **Apply the schema:** SQL Editor → paste & run `supabase/schema.sql` (tables, RLS policies, security-definer RPCs, views, storage buckets, default settings).
3. **Seed content:** SQL Editor → paste & run `supabase/seed.sql` (5 commissions, Mandat 2025–2026 + 12 members, 4 podcast episodes, 8 TEDx talks, 3 "À propos" sections). Mirrors the static `src/data` files so the DB-driven site renders identically to the old static site on day one.
4. **Auth settings:** Authentication → Providers → Email: **disable "Confirm email"**. Authentication → URL Configuration → Site URL: `https://dentalkclub-fmdc.vercel.app`.
   Security toggles status (verified live 2026-08-25):
   - **Leaked password protection: PRO PLAN ONLY** — Supabase returns `HTTP 402 "available on Pro Plans and up"` on the free tier (API, CLI and dashboard alike). Compensating control: **minimum password length 8 is enforced server-side and verified functionally**; the signup UI also warns against reused passwords.
   - **Minimum password length: 8** — already live server-side (verified: 6-char signup rejected with `weak_password`).
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
* **Domains `dentalkclub-fmdc.vercel.app` + `dtc-fmdc.vercel.app` are project-level domains** (2026-08-25): every `vercel --prod` deploy auto-aliases to them. Previously they were pinned to one deployment via a manual alias and silently stopped following new deploys.
* **Environment variables are PRODUCTION-ONLY** (2026-08-25). Preview deployments build without Supabase/YouTube keys and serve the static-fallback content — by design, so no unreviewed preview URL can ever talk to the production database. ⚠️ Vercel CLI gotcha: `vercel env rm <name> <environment>` deletes the whole variable (all environments), not just one target — remove/re-add carefully.
* **Security headers:** static headers (nosniff, XFO DENY, COOP/CORP, Referrer-Policy, Permissions-Policy, **Strict-Transport-Security** added 2026-09-01) come from `vercel.json`; the **Content-Security-Policy is built per-request in `src/utils/supabase/middleware.ts` with a nonce** (no `unsafe-inline` in `script-src`). Keep both in sync if origins change.
* **`.vercelignore`** still excludes `.venv/`, `scripts/`, `docs/`, `graphify-out/`, `instagram/`, `rules.md`, `overview.md`, and now `supabase/`.
* **CSP directive details** (built per request in the middleware, not vercel.json): `connect-src` allows `https://*.supabase.co wss://*.supabase.co`, `img-src` allows `i.ytimg.com` + Supabase storage; pasted media URLs outside that allowlist are rejected at save time (`mediaUrlError`).

---

## 🧠 5. Architecture Notes for Deployers

* **RLS is the enforcement layer.** The `/admin` console is a hidden route guarded server-side by role + by Postgres RLS for the data itself. Public pages read published content; drafts are invisible outside the bureau.
* **Static fallback:** every public page tries the database first and falls back to the static `src/data` seeds if Supabase is unreachable or the env vars are missing — the site can never blank out.
* **Session refresh** runs in `src/middleware.ts` (official Supabase pattern), keeping server components' cookies fresh.
* **Media:** the ~31 MB of TEDx MP4s still ship from `public/media` (see `docs/media/gallery.md` for the offload roadmap); avatars and mandate infographics live in Supabase Storage buckets `avatars` / `club-media`.
