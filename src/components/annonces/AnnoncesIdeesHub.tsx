"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Megaphone, Lightbulb, CalendarDays } from "lucide-react";
import AnnouncementsFeed from "@/components/annonces/AnnouncementsFeed";
import IdeasBoard from "@/components/idees/IdeasBoard";
import Reveal from "@/components/Reveal";
import type { AnnouncementBoardItem, IdeaBoardItem } from "@/lib/types";

export default function AnnoncesIdeesHub({
  initialAnnouncements,
  initialIdeas,
  defaultTab = "annonces",
}: {
  initialAnnouncements: AnnouncementBoardItem[];
  initialIdeas: IdeaBoardItem[];
  defaultTab?: "annonces" | "idees";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"annonces" | "idees">(
    tabParam === "idees" ? "idees" : defaultTab
  );
  // Live counts: the feeds own their lists after mount (create/vote/refresh),
  // so they report the length back and the pills never go stale.
  const [announcementsCount, setAnnouncementsCount] = useState(initialAnnouncements.length);
  const [ideasCount, setIdeasCount] = useState(initialIdeas.length);

  useEffect(() => {
    // Keep the tab and the URL saying the same thing: an explicit ?tab=
    // wins, an absent param resets to the default (a bare /annonces link
    // after /annonces?tab=idees must show the annonces tab again).
    if (tabParam === "idees" || tabParam === "annonces") {
      setActiveTab(tabParam);
    } else {
      setActiveTab(defaultTab);
    }
  }, [tabParam, defaultTab]);

  const handleTabChange = (tab: "annonces" | "idees") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "annonces") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const newQuery = params.toString();
    const newPath = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newPath, { scroll: false });
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Dynamic Header Banner */}
      <div className="max-w-2xl mx-auto space-y-2 sm:space-y-4 text-center">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-dtc-gold">
          {activeTab === "annonces"
            ? "La vie du club, en direct"
            : "Boîte à idées collaborative"}
        </p>

        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-dtc-ink tracking-tight">
          {activeTab === "annonces" ? "Annonces & Ateliers" : "Les Idées du Club"}
        </h1>

        <p className="text-xs sm:text-base text-dtc-inkMuted leading-relaxed">
          {activeTab === "annonces"
            ? "Les prochains ateliers d'éloquence, débats et informations officielles du bureau. Connectez-vous pour confirmer votre participation."
            : "Pitchez, votez, commentez : les meilleures idées du mois inspirent les prochains ateliers et débats. Un vote par personne et par idée."}
        </p>
      </div>

      {/* Dynamic Segmented Tab Switcher with Active Expansion */}
      <div className="flex items-center justify-center">
        <div className="bg-dtc-wash/90 p-1.5 rounded-2xl border border-dtc-line/60 inline-flex items-center gap-1.5 shadow-sm">
          {/* Annonces & Ateliers Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("annonces")}
            aria-pressed={activeTab === "annonces"}
            className={`flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl transition-all duration-300 ease-out cursor-pointer ${
              activeTab === "annonces"
                ? "bg-white text-dtc-ink font-bold px-4 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm shadow-md border border-dtc-line/70 scale-[1.02] z-10"
                : "text-dtc-inkMuted hover:text-dtc-ink hover:bg-white/50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium scale-95 opacity-80 hover:opacity-100"
            }`}
          >
            <Megaphone
              className={`transition-transform duration-300 ${
                activeTab === "annonces"
                  ? "w-4 h-4 text-dtc-gold scale-110"
                  : "w-3.5 h-3.5 text-dtc-inkMuted"
              }`}
            />
            <span className="tracking-tight whitespace-nowrap">
              Annonces &amp; Ateliers
            </span>
            {announcementsCount > 0 && (
              <span
                className={`transition-colors duration-300 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "annonces"
                    ? "bg-dtc-gold/15 text-dtc-gold"
                    : "bg-dtc-line/60 text-dtc-inkMuted"
                }`}
              >
                {announcementsCount}
              </span>
            )}
          </button>

          {/* Boîte à Idées Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("idees")}
            aria-pressed={activeTab === "idees"}
            className={`flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl transition-all duration-300 ease-out cursor-pointer ${
              activeTab === "idees"
                ? "bg-white text-dtc-ink font-bold px-4 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm shadow-md border border-dtc-line/70 scale-[1.02] z-10"
                : "text-dtc-inkMuted hover:text-dtc-ink hover:bg-white/50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium scale-95 opacity-80 hover:opacity-100"
            }`}
          >
            <Lightbulb
              className={`transition-transform duration-300 ${
                activeTab === "idees"
                  ? "w-4 h-4 text-dtc-gold scale-110"
                  : "w-3.5 h-3.5 text-dtc-inkMuted"
              }`}
            />
            <span className="tracking-tight whitespace-nowrap">
              Boîte à Idées
            </span>
            {ideasCount > 0 && (
              <span
                className={`transition-colors duration-300 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "idees"
                    ? "bg-dtc-gold/15 text-dtc-gold"
                    : "bg-dtc-line/60 text-dtc-inkMuted"
                }`}
              >
                {ideasCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <Reveal>
        <div className="pt-2">
          {activeTab === "annonces" ? (
            <div className="space-y-6">
              <AnnouncementsFeed initialItems={initialAnnouncements} onCountChange={setAnnouncementsCount} />
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-dtc-inkSoft pt-2">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>
                  Les ateliers ont lieu à la FMDC Casablanca — la salle est précisée dans chaque annonce.
                </span>
              </p>
            </div>
          ) : (
            <IdeasBoard initialItems={initialIdeas} onCountChange={setIdeasCount} />
          )}
        </div>
      </Reveal>
    </div>
  );
}
