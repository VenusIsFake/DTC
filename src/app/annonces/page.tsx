import React from "react";
import { CalendarDays } from "lucide-react";
import AnnouncementsFeed from "@/components/annonces/AnnouncementsFeed";
import { getPublishedAnnouncements } from "@/lib/data";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Annonces & Ateliers",
  description:
    "Fil officiel du Dentalk Club FMDC : ateliers hebdomadaires d'éloquence, annonces du bureau et participation en un clic.",
  alternates: {
    canonical: "/annonces",
  },
};

export default async function AnnoncesPage() {
  const announcements = await getPublishedAnnouncements();

  return (
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-10">
      {/* Header Banner */}
      <div className="max-w-2xl mx-auto space-y-2 sm:space-y-4">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6D1F]">
          La vie du club, en direct
        </p>
        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-[#16233A] tracking-tight">
          Annonces &amp; Ateliers
        </h1>
        <p className="text-xs sm:text-base text-[#5C6672] leading-relaxed">
          Les prochains ateliers d&apos;éloquence, débats et informations officielles du bureau.
          Connectez-vous pour confirmer votre participation.
        </p>
      </div>

      {/* Feed */}
      <Reveal>
      <AnnouncementsFeed initialItems={announcements} />
      </Reveal>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A828D] pt-2">
        <CalendarDays className="w-3.5 h-3.5" />
        Les ateliers ont lieu à la FMDC Casablanca — la salle est précisée dans chaque annonce.
      </p>
    </div>
  );
}
