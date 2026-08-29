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

  useEffect(() => {
    if (tabParam === "idees" || tabParam === "annonces") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
      <div className="max-w-2xl mx-auto space-y-2 sm:space-y-4 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">
          {activeTab === "annonces"
            ? "La vie du club, en direct"
            : "Boîte à idées collaborative"}
        </p>

        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-[#16233A] tracking-tight">
          {activeTab === "annonces" ? "Annonces & Ateliers" : "Les Idées du Club"}
        </h1>

        <p className="text-xs sm:text-base text-[#5C6672] leading-relaxed">
          {activeTab === "annonces"
            ? "Les prochains ateliers d'éloquence, débats et informations officielles du bureau. Connectez-vous pour confirmer votre participation."
            : "Pitchez, votez, commentez : les meilleures idées du mois inspirent les prochains ateliers et débats. Un vote par personne et par idée."}
        </p>
      </div>

      {/* Dynamic Segmented Tab Switcher with Active Expansion */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="bg-[#EFECE4]/90 p-1.5 rounded-2xl border border-[#DCD7CB]/60 inline-flex items-center gap-1.5 shadow-sm">
          {/* Annonces & Ateliers Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("annonces")}
            className={`flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl transition-all duration-300 ease-out cursor-pointer ${
              activeTab === "annonces"
                ? "bg-white text-[#16233A] font-bold px-4 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm shadow-md border border-[#DCD7CB]/70 scale-[1.02] z-10"
                : "text-[#5C6672] hover:text-[#16233A] hover:bg-white/50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium scale-95 opacity-80 hover:opacity-100"
            }`}
          >
            <Megaphone
              className={`transition-transform duration-300 ${
                activeTab === "annonces"
                  ? "w-4 h-4 text-[#755B18] scale-110"
                  : "w-3.5 h-3.5 text-[#5C6672]"
              }`}
            />
            <span className="tracking-tight whitespace-nowrap">
              Annonces &amp; Ateliers
            </span>
            {initialAnnouncements.length > 0 && (
              <span
                className={`transition-colors duration-300 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "annonces"
                    ? "bg-[#755B18]/15 text-[#755B18]"
                    : "bg-[#DCD7CB]/60 text-[#5C6672]"
                }`}
              >
                {initialAnnouncements.length}
              </span>
            )}
          </button>

          {/* Boîte à Idées Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("idees")}
            className={`flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl transition-all duration-300 ease-out cursor-pointer ${
              activeTab === "idees"
                ? "bg-white text-[#16233A] font-bold px-4 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm shadow-md border border-[#DCD7CB]/70 scale-[1.02] z-10"
                : "text-[#5C6672] hover:text-[#16233A] hover:bg-white/50 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium scale-95 opacity-80 hover:opacity-100"
            }`}
          >
            <Lightbulb
              className={`transition-transform duration-300 ${
                activeTab === "idees"
                  ? "w-4 h-4 text-[#755B18] scale-110"
                  : "w-3.5 h-3.5 text-[#5C6672]"
              }`}
            />
            <span className="tracking-tight whitespace-nowrap">
              Boîte à Idées
            </span>
            {initialIdeas.length > 0 && (
              <span
                className={`transition-colors duration-300 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "idees"
                    ? "bg-[#755B18]/15 text-[#755B18]"
                    : "bg-[#DCD7CB]/60 text-[#5C6672]"
                }`}
              >
                {initialIdeas.length}
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
              <AnnouncementsFeed initialItems={initialAnnouncements} />
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#5F6774] pt-2">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>
                  Les ateliers ont lieu à la FMDC Casablanca — la salle est précisée dans chaque annonce.
                </span>
              </p>
            </div>
          ) : (
            <IdeasBoard initialItems={initialIdeas} />
          )}
        </div>
      </Reveal>
    </div>
  );
}
