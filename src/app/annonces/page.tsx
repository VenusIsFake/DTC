import React from "react";
import { Megaphone, CalendarDays } from "lucide-react";
import AnnouncementsFeed from "@/components/annonces/AnnouncementsFeed";
import { getPublishedAnnouncements } from "@/lib/data";

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
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <Megaphone className="w-3.5 h-3.5" />
          <span>La vie du club, en direct</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-heading font-extrabold text-white">
          Annonces & <span className="gold-gradient-text">Ateliers</span>
        </h1>
        <p className="text-xs sm:text-base text-[#94A3B8] leading-relaxed">
          Les prochains ateliers d&apos;éloquence, débats et informations officielles du bureau.
          Connectez-vous pour confirmer votre participation.
        </p>
      </div>

      {/* Feed */}
      <AnnouncementsFeed initialItems={announcements} />

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] pt-2">
        <CalendarDays className="w-3.5 h-3.5" />
        Les ateliers ont lieu à la FMDC Casablanca — la salle est précisée dans chaque annonce.
      </p>
    </div>
  );
}
