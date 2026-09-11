import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const SECRET_HOST = 'dentalkclub-fmdc.vercel.app'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  if (host === SECRET_HOST) {
    return NextResponse.rewrite(new URL('/secret', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/secret')) {
    // secret page only lives on the backstage host — main domain gets nothing
    return NextResponse.rewrite(new URL('/', request.url))
  }
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
