/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // The service worker must revalidate on every check so a VERSION
        // bump propagates immediately, not after the browser's daily recheck.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        // Local media (TEDx reels, posters, team visuals): stable files, so a
        // 1-day fresh window + 7-day revalidate window cuts repeat downloads
        // without hiding a replaced file for long. The service worker
        // (rules.md §10) layers longer-lived client caching on top.
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:file(favicon.ico|favicon.png|logo.png|icon.png|icon-512.png|apple-touch-icon.png|apple-icon.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
