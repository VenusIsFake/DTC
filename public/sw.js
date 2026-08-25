/*
 * DTC service worker — client-side caching for repeat visitors.
 *
 * Bandwidth rules (Hobby plan):
 *  - Pages are NEVER intercepted or cached: every navigation goes straight
 *    to the network, so a new production deploy is visible on the very next
 *    page load. (HTML is small and streamed by Next.js — caching streamed
 *    responses risks serving broken/partial swaps, so we only provide a
 *    static offline fallback page.)
 *  - Hashed build assets (/_next/static) are cache-first: a new deploy ships
 *    new hashes, so stale entries are never served.
 *  - Media (site /media files, YouTube posters, Supabase storage images) use
 *    stale-while-revalidate: served instantly from cache, refreshed in the
 *    background so the *next* load shows a replaced file.
 *  - Never cached: /api routes, Supabase auth/REST/realtime traffic, and
 *    anything that is not a GET (votes, RSVPs, session tokens must stay live).
 *  - Video Range requests (streaming/seeks) bypass the SW: partial 206
 *    responses cannot be stored in the Cache API.
 *
 * Bump VERSION whenever this logic changes — old caches are dropped on
 * activate (see rules.md §10).
 */
const VERSION = "2026-08-25.2";
const STATIC_CACHE = `dtc-static-${VERSION}`; // _next/static, fonts
const MEDIA_CACHE = `dtc-media-${VERSION}`; // images, posters, local media

const MEDIA_CACHE_MAX = 120;

const MEDIA_EXTENSIONS = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|mov|woff2?)$/i;

const OFFLINE_HTML =
  "<!doctype html><html lang=fr><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" +
  "<body style='background:#0B132B;color:#CBD5E1;font-family:sans-serif;text-align:center;padding-top:40vh'>" +
  "<h1 style='color:#D4AF37'>Hors ligne</h1><p>Reconnectez-vous pour recharger le site du Dentalk Club.</p></body></html>";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("dtc-") && !name.endsWith(VERSION))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxEntries);
  }
}

/** Serve from cache immediately, refresh in the background (next load is fresh). */
async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && !response.headers.has("content-range")) {
        cache.put(request, response.clone()).then(() => trimCache(cacheName, maxEntries));
      }
      return response;
    })
    .catch(() => null);
  return cached || (await network) || new Response("Hors ligne", { status: 503 });
}

/** Cache-first for hashed/immutable or opaque cross-origin assets. */
async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // status 0 = opaque (cross-origin no-cors, e.g. YouTube posters)
  if (response && (response.status === 200 || response.status === 0)) {
    cache.put(request, response.clone()).then(() => trimCache(cacheName, maxEntries));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Navigations: never intercepted — always the live network (fresh deploys),
  // with a static offline page when the network is unreachable.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => new Response(OFFLINE_HTML, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } })));
    return;
  }

  // Never intercept: app API routes, Supabase auth/REST/realtime.
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;
  if (url.hostname.endsWith(".supabase.co")) {
    // Public storage objects (avatars, posters) are cacheable; everything
    // else on Supabase (auth, REST, realtime) must stay live.
    if (!url.pathname.startsWith("/storage/v1/object/public/")) return;
  }

  // Video streaming/seeks use Range requests — pass through untouched.
  if (request.headers.has("range")) return;

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(cacheFirst(request, STATIC_CACHE, 200));
      return;
    }
    if (url.pathname.startsWith("/media/") || MEDIA_EXTENSIONS.test(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE, MEDIA_CACHE_MAX));
      return;
    }
    return; // everything else same-origin: plain network
  }

  if (url.hostname === "i.ytimg.com") {
    event.respondWith(cacheFirst(request, MEDIA_CACHE, MEDIA_CACHE_MAX));
    return;
  }
  if (url.hostname.endsWith(".supabase.co")) {
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE, MEDIA_CACHE_MAX));
    return;
  }
});
