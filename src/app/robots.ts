import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/espace", "/api/"],
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
