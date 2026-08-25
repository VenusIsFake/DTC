import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/siteConfig";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
  themeColor: "#0B132B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="bg-[#0B132B] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-[#D4AF37]/30 selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
