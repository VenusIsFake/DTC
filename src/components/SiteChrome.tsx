"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { NavItem } from "@/data/siteConfig";
import type { PartnerCard } from "@/lib/types";

/**
 * Site chrome (navbar + footer) wrapper. Standalone surfaces shared by link
 * only — currently /candidature, the bureau application form — render with
 * no chrome and no path into the main website (Google-Form-like isolation).
 */
export default function SiteChrome({
  navItems,
  tagline,
  sponsor,
  partnerClub,
  children,
}: {
  navItems: NavItem[];
  tagline?: string;
  sponsor?: PartnerCard;
  partnerClub?: PartnerCard;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/candidature")) {
    return <>{children}</>;
  }
  return (
    <>
      <Navbar navItems={navItems} />
      <main className="flex-grow">{children}</main>
      <Footer
        navItems={navItems}
        tagline={tagline}
        sponsor={sponsor}
        partnerClub={partnerClub}
      />
    </>
  );
}
