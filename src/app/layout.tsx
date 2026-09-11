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
  logo: `${siteConfig.siteUrl}/logo.png`,
  foundingDate: "2024-11",
  description: siteConfig.description,
  sameAs: [siteConfig.instagramUrl, siteConfig.youtubeChannelUrl],
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
        url: "/og-image-2026.jpg",
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
    images: ["/og-image-2026.jpg"],
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
      <body className="bg-[#F7F5F0] text-[#16233A] min-h-screen flex flex-col antialiased selection:bg-[#755B18]/20 selection:text-[#16233A]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Escape "<" so no value can ever close the script tag early.
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
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
