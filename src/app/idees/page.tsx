import React from "react";
import IdeasBoard from "@/components/idees/IdeasBoard";
import { getIdeaBoard } from "@/lib/data";
import Reveal from "@/components/Reveal";

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
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-10">
      {/* Header Banner */}
      <div className="max-w-2xl mx-auto space-y-2 sm:space-y-4">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8A6D1F]">
          Boîte à idées collaborative
        </p>
        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-[#16233A] tracking-tight">
          Les Idées du Club
        </h1>
        <p className="text-xs sm:text-base text-[#5C6672] leading-relaxed">
          Pitchez, votez, commentez : les meilleures idées du mois inspirent les prochains ateliers
          et épisodes du podcast. Un vote par personne et par idée.
        </p>
      </div>

      <Reveal>
      <IdeasBoard initialItems={ideas} />
      </Reveal>
    </div>
  );
}
