import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/siteConfig";
import { getSiteSettings, getPublishedEventSlugs } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, eventSlugs] = await Promise.all([getSiteSettings(), getPublishedEventSlugs()]);

  const routes = ["", "/annonces", "/idees", "/podcast", "/gallery", "/about"];
  if (settings.events_visible) {
    routes.push("/events");
  }

  const entries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  // Event landing pages follow the events section visibility.
  if (settings.events_visible) {
    for (const slug of eventSlugs) {
      entries.push({
        url: `${siteConfig.siteUrl}/events/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // /admin and /espace are intentionally absent (private surfaces).
  return entries;
}
