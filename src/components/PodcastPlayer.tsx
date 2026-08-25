"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Youtube, Award, Clock, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import type { PodcastEpisode } from "@/data/podcastData";

export default function PodcastPlayer({ episodes }: { episodes: PodcastEpisode[] }) {
  const [selectedEp, setSelectedEp] = useState<PodcastEpisode | null>(episodes[0] ?? null);

  if (!selectedEp) {
    return (
      <div className="glass-card rounded-2xl border border-[#385A75]/40 p-8 text-center">
        <p className="text-sm font-semibold text-white">Aucun épisode publié pour le moment</p>
        <p className="text-xs text-[#94A3B8] mt-1">Le prochain épisode du Let&apos;s Talk Podcast arrive bientôt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Featured Player Card */}
      <div className="glass-card p-3.5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
          {/* Video / YouTube Screen */}
          <div className="lg:col-span-7 space-y-2.5 sm:space-y-4">
            <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-[#385A75]/50 shadow-xl group">
              <iframe
                key={selectedEp.id}
                src={`https://www.youtube.com/embed/${selectedEp.youtubeId}?rel=0&playsinline=1`}
                title={selectedEp.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-[#94A3B8] px-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1 font-medium text-[#CBD5E1]">
                  <Calendar className="w-3 h-3 text-[#D4AF37]" />
                  <span>{selectedEp.releaseDate}</span>
                </span>
                <span className="flex items-center gap-1 font-medium text-[#CBD5E1]">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  <span>{selectedEp.duration}</span>
                </span>
              </div>
              <span className="flex items-center gap-1 font-semibold text-[#D4AF37]">
                <Award className="w-3 h-3" />
                <span>Sponsor: {selectedEp.sponsor}</span>
              </span>
            </div>
          </div>

          {/* Episode Info & Synopsis */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-5">
            <div className="space-y-1 sm:space-y-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                <span>Épisode {selectedEp.episodeNumber}</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-heading font-extrabold text-white leading-tight">
                {selectedEp.guest}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#D4AF37]">
                {selectedEp.role}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {selectedEp.synopsis}
            </p>

            {/* Key Clinical & Academic Takeaways */}
            <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-[#385A75]/30">
              <h4 className="text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider text-[#CBD5E1]">
                Points Clés & Enseignements
              </h4>
              <ul className="space-y-1 sm:space-y-1.5">
                {selectedEp.takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#CBD5E1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              <a
                href={selectedEp.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs bg-red-600 hover:bg-red-700 text-white transition-all shadow-md"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Regarder sur YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Selector Grid */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
          <span>Tous les Épisodes Let&apos;s Talk</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          {episodes.map((ep) => {
            const isCurrent = selectedEp.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => setSelectedEp(ep)}
                className={`text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center gap-3 group ${
                  isCurrent
                    ? "bg-[#1B2E4B] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                    : "glass-card hover:border-[#385A75] hover:bg-[#1B2E4B]/40"
                }`}
              >
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-[#385A75]/50">
                  <Image
                    src={ep.posterImage}
                    alt={ep.guest}
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current opacity-80" />
                  </div>
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#D4AF37] block">
                    ÉPISODE {ep.episodeNumber}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                    {ep.guest}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-[#94A3B8] truncate">{ep.releaseDate}</p>
                </div>

                <ChevronRight className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform shrink-0 ${isCurrent ? "text-[#D4AF37] translate-x-0.5" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
