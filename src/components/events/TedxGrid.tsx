"use client";

import React, { useState } from "react";
import Image from "next/image";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import type { TedxTalk } from "@/data/tedxData";
import { Play, Calendar } from "lucide-react";

/** Interactive TEDx talks grid (cards + fullscreen video modal). */
export default function TedxGrid({ talks }: { talks: TedxTalk[] }) {
  const [activeTalk, setActiveTalk] = useState<TedxTalk | null>(null);

  return (
    <section className="space-y-4 sm:space-y-8">
      <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 relative overflow-hidden space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 border-b border-[#385A75]/30 pb-4 sm:pb-6">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
              Première Édition Historique · 22 Nov 2025
            </span>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-white">
              TEDxFMDC — Les {talks.length} Talks Officiels
            </h2>
          </div>
          <div className="text-xs text-[#94A3B8] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Amphithéâtre FMDC Casablanca</span>
          </div>
        </div>

        {/* Amphitheater Hero Stage Banner */}
        <div className="relative w-full aspect-[16/8] sm:aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/50 shadow-xl bg-black">
          <Image
            src="/media/events/tedx_fmdc_auditorium.jpg"
            alt="Scène TEDxFMDC Amphithéâtre"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3.5 sm:p-6">
            <div className="text-white space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
                Scène Officielle TEDxFMDC
              </span>
              <h3 className="text-sm sm:text-xl font-heading font-bold">
                {talks.length} Orateurs Étudiants · Extraits Vidéo Officiels
              </h3>
            </div>
          </div>
        </div>

        {/* Video Reel Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 pt-2 sm:pt-4">
          {talks.map((talk) => (
            <div
              key={talk.id}
              role="button"
              tabIndex={0}
              aria-label={`Regarder l'extrait vidéo : ${talk.topic}`}
              onClick={() => setActiveTalk(talk)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveTalk(talk);
                }
              }}
              className="glass-card glass-card-hover rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/40 flex flex-col group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              {/* 9:16 Video Thumbnail Container */}
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                <Image
                  src={talk.posterUrl}
                  alt={talk.topic}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#D4AF37] text-[#0B132B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-black/70 text-[#D4AF37] border border-[#D4AF37]/30">
                  Extrait {talk.extractNumber}/{talks.length}
                </div>

                <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-[#1B2E4B]/80 text-white">
                  {talk.language}
                </div>

                <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-black/70 text-white">
                  {talk.duration}
                </div>
              </div>

              {/* Talk Info */}
              <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
                <div className="space-y-0.5 sm:space-y-1">
                  <span className="text-[10px] sm:text-xs font-semibold text-[#D4AF37] block truncate">
                    {talk.speaker}
                  </span>
                  <h4 className="text-xs sm:text-sm font-heading font-bold text-white line-clamp-2 leading-snug">
                    {talk.topic}
                  </h4>
                </div>

                <span className="text-[10px] sm:text-[11px] text-[#94A3B8] font-medium flex items-center gap-1 pt-1.5 sm:pt-2 border-t border-[#385A75]/20">
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D4AF37] fill-current" />
                  <span className="truncate">Lancer la vidéo</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <VideoPlayerModal talk={activeTalk} onClose={() => setActiveTalk(null)} />
    </section>
  );
}
