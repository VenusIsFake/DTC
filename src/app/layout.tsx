import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/auth/AuthProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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
        url: "/logo.png",
        width: 716,
        height: 716,
        alt: "Dentalk Club FMDC Official Logo",
      },
    ],
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
          <Navbar navItems={navItems} />
          <main className="flex-grow">{children}</main>
          <Footer navItems={navItems} />
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
