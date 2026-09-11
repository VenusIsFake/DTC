"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { NavItem } from "@/data/siteConfig";
import type { PartnerCard } from "@/lib/types";

/**
 * Site chrome (navbar + footer) wrapper. Standalone surfaces shared by link
 * only — /candidature (bureau application form) and /invitation (one-time
 * invite links) — render with no chrome and no path into the main website
 * (Google-Form-like isolation).
 */
export default function SiteChrome({
  navItems,
  tagline,
  sponsor,
  partnerClub,
  forceChromeless = false,
  children,
}: {
  navItems: NavItem[];
  tagline?: string;
  sponsor?: PartnerCard;
  partnerClub?: PartnerCard;
  /** server-side override (middleware header) — client pathname misses rewrites */
  forceChromeless?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const chromeless =
    forceChromeless ||
    pathname.startsWith("/candidature") ||
    pathname === "/invitation" ||
    pathname.startsWith("/invitation/") ||
    pathname.startsWith("/secret");
  if (chromeless) {
    return <>{children}</>;
  }
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only fixed top-2 left-2 z-[100] px-3 py-2 rounded-lg bg-[#755B18] text-[#F7F5F0] text-xs font-bold shadow-lg"
      >
        Aller au contenu
      </a>
      <Navbar navItems={navItems} />
      <main id="contenu" className="flex-grow">
        {children}
      </main>
      <Footer
        navItems={navItems}
        tagline={tagline}
        sponsor={sponsor}
        partnerClub={partnerClub}
      />
    </>
  );
}
