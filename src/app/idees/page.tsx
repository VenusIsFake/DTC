import React from "react";
import { Lightbulb } from "lucide-react";
import IdeasBoard from "@/components/idees/IdeasBoard";
import { getIdeaBoard } from "@/lib/data";

export const metadata = {
  title: "Idées du Club",
  description:
    "Proposez vos idées d'ateliers, de débats et d'événements, votez pour vos préférées et commentez — la boîte à idées officielle du Dentalk Club FMDC.",
  alternates: {
    canonical: "/idees",
  },
};

export default async function IdeesPage() {
  const ideas = await getIdeaBoard();

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Boîte à idées collaborative</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-heading font-extrabold text-white">
          Les <span className="gold-gradient-text">Idées</span> du Club
        </h1>
        <p className="text-xs sm:text-base text-[#94A3B8] leading-relaxed">
          Pitchez, votez, commentez : les meilleures idées du mois inspirent les prochains ateliers
          et épisodes du podcast. Un vote par personne et par idée.
        </p>
      </div>

      <IdeasBoard initialItems={ideas} />
    </div>
  );
}
