import React from "react";
import Image from "next/image";
import PodcastPlayer from "@/components/PodcastPlayer";
import { Radio, Camera } from "lucide-react";
import { getPodcastEpisodes } from "@/lib/data";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Let's Talk Podcast",
  description: "Le podcast officiel de Dentalk Club FMDC en co-production avec le Club Social Dentaire, sponsorisé par Flex Dental.",
  alternates: {
    canonical: "/podcast",
  },
};

export default async function PodcastPage() {
  const episodes = await getPodcastEpisodes();
  return (
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-14">
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <p className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-red-700">
          <Radio className="w-3.5 h-3.5" />
          <span>Un podcast par les étudiants, pour les étudiants</span>
        </p>
        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-[#16233A] tracking-tight">
          Let&apos;s Talk Podcast
        </h1>
        <p className="text-xs sm:text-base text-[#5C6672] leading-relaxed">
          Entretiens approfondis avec des professeurs d&apos;exception, cliniciens chevronnés et leaders d&apos;opinion de la médecine dentaire.
        </p>
      </div>

      {/* Main Interactive Podcast Center */}
      <PodcastPlayer episodes={episodes} />

      {/* Behind The Scenes & Studio Production */}
      <Reveal>
      <section className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-[#DCD7CB]/50 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-[#DCD7CB]/30 pb-3 sm:pb-4">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#755B18]">
              <Camera className="w-3.5 h-3.5" />
              <span>Coulisses & Production Studio</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-heading font-bold text-[#16233A]">
              Dans les coulisses de l&apos;enregistrement
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-start">
          <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border border-[#DCD7CB]/60 shadow-sm">
            <Image
              src="/media/podcasts/studio_bts_viewfinder.jpg"
              alt="Moniteur Studio Let's Talk"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-2.5 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-heading font-bold text-[#16233A]">
              Une production audio-visuelle rigoureuse
            </h4>
            <p className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed">
              Chaque épisode est tourné dans des conditions professionnelles avec régie multi-caméras DSLR, microphones de studio cardioïdes et éclairage cinématique sous la direction du Pôle Média de DTC.
            </p>
            <div className="pt-1 flex flex-wrap gap-2.5 sm:gap-4 text-xs">
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#EFECE4]/50 border border-[#DCD7CB]/30">
                <span className="text-[#5C6672] block text-[10px] sm:text-xs">Co-Production</span>
                <span className="font-semibold text-[#16233A] text-[11px] sm:text-xs">DTC × Club Social Dentaire</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#EFECE4]/50 border border-[#DCD7CB]/30">
                <span className="text-[#5C6672] block text-[10px] sm:text-xs">Partenaire & Sponsor</span>
                <span className="font-semibold text-[#755B18] text-[11px] sm:text-xs">Flex Dental</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Reveal>
    </div>
  );
}
