import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { siteConfig } from '@/data/siteConfig'

const SECRET_HOST = siteConfig.secretHost
const DEAD_HOST = 'dentalkclub-fmdc.vercel.app'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  if (host === DEAD_HOST) {
    // retired host — owner asked it dead, serve nothing
    return new Response(null, { status: 404 })
  }
  if (host === SECRET_HOST) {
    const headers = new Headers(request.headers)
    headers.set('x-secret-page', '1')
    return NextResponse.rewrite(new URL('/secret', request.url), {
      request: { headers },
    })
  }
  if (request.nextUrl.pathname.startsWith('/secret')) {
    // secret page only lives on the backstage host — main domain gets nothing
    return NextResponse.rewrite(new URL('/', request.url))
  }
  // Overwrite (never trust an inbound value): a client-sent x-secret-page: 1
  // would otherwise strip the site chrome on any page. Mutating the request
  // headers is enough — updateSession forwards them to the rendered page.
  request.headers.set('x-secret-page', '0')
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker — served verbatim, no session/CSP work needed)
     * - images / media / assets / raw media files
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|ico|webmanifest)$).*)',
  ],
}
