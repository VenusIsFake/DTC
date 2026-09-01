import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/client'

// Per-request nonce CSP. Next.js reads the CSP/nonce off the forwarded request
// headers and stamps the nonce on every script it renders, which removes the
// need for 'unsafe-inline' in script-src. vercel.json keeps the static
// non-CSP security headers; the CSP only exists here.
function securityContext(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const isDev = process.env.NODE_ENV !== 'production'
  // Cloudflare Turnstile origins are allowlisted up front so enabling the
  // captcha later only requires the dashboard secret + site key env var
  // (docs/platform/deployment.md § Captcha) — no CSP edit needed.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    // blob: — local previews of user-picked files (avatar crop modal) before upload.
    "img-src 'self' data: blob: https://i.ytimg.com https://*.supabase.co",
    "media-src 'self'",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
    "frame-src https://www.youtube.com https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('content-security-policy', csp)

  // Every (re)built response must forward the nonce-bearing request headers
  // AND carry the CSP itself.
  const next = () => {
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('content-security-policy', csp)
    return response
  }

  return { next }
}

// ---------------------------------------------------------------------------
// Site wall (2026-09-01, at Venus's request): until the club opens the main
// website, every path except the standalone application form is served only
// to bureau/admin sessions — enforced here in middleware, before rendering,
// not with any client-side trick. `/api/*` stays reachable (each route does
// its own role checks and must answer JSON, not a redirect). The bureau can
// lift the wall from the console (Accueil tab) via the `site_wall_open`
// setting — no deploy needed.
// ---------------------------------------------------------------------------

const PUBLIC_PATHS = ["/candidature"];

async function siteWallOpen(supabase: ReturnType<typeof createServerClient>): Promise<boolean> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "site_wall_open")
    .maybeSingle();
  return (data as { value?: unknown } | null)?.value === true;
}

export async function updateSession(request: NextRequest) {
  const { next } = securityContext(request)

  // Static-fallback invariant: without Supabase env vars the app must keep
  // serving its public pages instead of erroring on every request.
  if (!isSupabaseConfigured()) {
    return next()
  }

  let supabaseResponse = next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = next()
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and supabase.auth.getUser()
  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublicPath = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))

  if (isPublicPath || path.startsWith("/api/")) {
    return supabaseResponse
  }

  // Wall decision needs the visitor's role (my_profile RPC — role is not a
  // column-granted field) and the console toggle.
  const [profileResult, wallOpen] = await Promise.all([
    user ? supabase.rpc("my_profile") : Promise.resolve({ data: null } as const),
    siteWallOpen(supabase),
  ])

  if (wallOpen) {
    return supabaseResponse
  }

  const profile = (profileResult.data as Array<{ role?: string; is_banned?: boolean }> | null)?.[0]
  const isStaff =
    !!profile && !profile.is_banned && (profile.role === "bureau" || profile.role === "admin")

  if (!isStaff) {
    const redirect = NextResponse.redirect(new URL("/candidature", request.url))
    // Preserve the in-flight auth cookies set by the session refresh above.
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      redirect.cookies.set(name, value)
    )
    return redirect
  }

  return supabaseResponse
}
