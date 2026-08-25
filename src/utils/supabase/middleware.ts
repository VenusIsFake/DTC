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
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://i.ytimg.com https://*.supabase.co",
    "media-src 'self'",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src https://www.youtube.com",
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
  await supabase.auth.getUser()

  return supabaseResponse
}
