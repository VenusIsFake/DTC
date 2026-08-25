import React from "react";
import Image from "next/image";
import PodcastPlayer from "@/components/PodcastPlayer";
import { Radio, Camera } from "lucide-react";

export const metadata = {
  title: "Let's Talk Podcast",
  description: "Le podcast officiel de Dentalk Club FMDC en co-production avec le Club Social Dentaire, sponsorisé par Flex Dental.",
  alternates: {
    canonical: "/podcast",
  },
};

export default function PodcastPage() {
  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30">
          <Radio className="w-3.5 h-3.5" />
          <span>Le Podcast des Étudiants, par les Étudiants</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-heading font-extrabold text-white">
          LET&apos;S TALK <span className="gold-gradient-text">PODCAST</span>
        </h1>
        <p className="text-xs sm:text-base text-[#94A3B8] leading-relaxed">
          Entretiens approfondis avec des professeurs d&apos;exception, cliniciens chevronnés et leaders d&apos;opinion de la médecine dentaire.
        </p>
      </div>

      {/* Main Interactive Podcast Center */}
      <PodcastPlayer />

      {/* Behind The Scenes & Studio Production */}
      <section className="glass-card p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-[#385A75]/30 pb-3 sm:pb-4">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#D4AF37]">
              <Camera className="w-3.5 h-3.5" />
              <span>Coulisses & Production Studio</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-heading font-bold text-white">
              Dans les coulisses de l&apos;enregistrement
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/50 shadow-xl">
            <Image
              src="/media/podcasts/studio_bts_viewfinder.jpg"
              alt="Moniteur Studio Let's Talk"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-2.5 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-heading font-bold text-white">
              Une production audio-visuelle rigoureuse
            </h4>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              Chaque épisode est tourné dans des conditions professionnelles avec régie multi-caméras DSLR, microphones de studio cardioïdes et éclairage cinématique sous la direction du Pôle Média de DTC.
            </p>
            <div className="pt-1 flex flex-wrap gap-2.5 sm:gap-4 text-xs">
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#1B2E4B]/50 border border-[#385A75]/30">
                <span className="text-[#94A3B8] block text-[10px] sm:text-xs">Co-Production</span>
                <span className="font-semibold text-white text-[11px] sm:text-xs">DTC × Club Social Dentaire</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#1B2E4B]/50 border border-[#385A75]/30">
                <span className="text-[#94A3B8] block text-[10px] sm:text-xs">Partenaire & Sponsor</span>
                <span className="font-semibold text-[#D4AF37] text-[11px] sm:text-xs">Flex Dental</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
