import React, { Suspense } from "react";
import AnnoncesIdeesHub from "@/components/annonces/AnnoncesIdeesHub";
import { getPublishedAnnouncements, getIdeaBoard } from "@/lib/data";

export const metadata = {
  title: "Annonces & Idées",
  description:
    "Hub communautaire de Dentalk Club FMDC : ateliers hebdomadaires d'éloquence, annonces officielles du bureau et boîte à idées collaborative.",
  alternates: {
    canonical: "/annonces",
  },
};

export default async function AnnoncesPage() {
  const [announcements, ideas] = await Promise.all([
    getPublishedAnnouncements(),
    getIdeaBoard(),
  ]);

  return (
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-[#5C6672]">Chargement...</div>}>
        <AnnoncesIdeesHub
          initialAnnouncements={announcements}
          initialIdeas={ideas}
        />
      </Suspense>
    </div>
  );
}
