import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { headers } from "next/headers";
import "@/styles/globals.css";
import SiteChrome from "@/components/SiteChrome";
import AuthProvider from "@/components/auth/AuthProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/data/siteConfig";
import { getSiteSettings } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  alternateName: siteConfig.acronym,
  url: siteConfig.siteUrl,
  logo: `${siteConfig.siteUrl}${siteConfig.assetUrl("/logo.png")}`,
  foundingDate: "2024-11",
  description: siteConfig.description,
  sameAs: [siteConfig.instagramUrl, siteConfig.youtubeChannelUrl],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: siteConfig.acronym,
  url: siteConfig.siteUrl,
  inLanguage: "fr",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Dentalk Club FMDC",
    "DTC",
    "FMDC Casablanca",
    "Éloquence dentaire",
    "Débats étudiants",
    "Let's Talk Podcast",
    "TEDxFMDC",
    "Université Hassan II",
    "Chirurgie dentaire Maroc",
  ],
  authors: [{ name: "Dentalk Club FMDC" }],
  creator: "Dentalk Club FMDC",
  // Icon URLs derive from siteConfig.assetUrl — bump assetVersion there (one
  // place) to invalidate every browser + the service worker at once.
  icons: {
    shortcut: siteConfig.assetUrl("/favicon.ico"),
    icon: [
      { url: siteConfig.assetUrl("/favicon.png"), sizes: "32x32", type: "image/png" },
      { url: siteConfig.assetUrl("/icon-512.png"), sizes: "512x512", type: "image/png" },
    ],
    apple: siteConfig.assetUrl("/apple-touch-icon.png"),
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Dentalk Club FMDC Official Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F5F0",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nav is settings-aware: a hidden section disappears from the navigation
  // entirely (redirect + de-index happen in the page itself).
  const settings = await getSiteSettings();
  const navItems = siteConfig.getNavItems(settings.events_visible);
  // Secret backstage host: strip chrome server-side (client usePathname
  // sees the pre-rewrite URL, so it can't detect middleware rewrites).
  const isSecretPage = (await headers()).get("x-secret-page") === "1";

  return (
    <html lang="fr" className={`${inter.variable} ${display.variable}`}>
      <body className="bg-dtc-paper text-dtc-ink min-h-screen flex flex-col antialiased selection:bg-dtc-gold/20 selection:text-dtc-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escape "<" so no value can ever close the script tag early.
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]).replace(/</g, "\\u003c"),
          }}
        />
        <AuthProvider>
          <SiteChrome
            navItems={navItems}
            tagline={settings.hero_tagline}
            sponsor={settings.sponsor}
            partnerClub={settings.partner_club}
            forceChromeless={isSecretPage}
          >
            {children}
          </SiteChrome>
        </AuthProvider>
        <ServiceWorkerRegister />
      <Analytics />
      <SpeedInsights />
      </body>
    </html>
  );
}
