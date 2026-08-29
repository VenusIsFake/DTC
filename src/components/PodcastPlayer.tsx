"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Youtube, Award, Clock, Calendar, CheckCircle2, ChevronRight, Eye } from "lucide-react";
import type { PodcastEpisode } from "@/data/podcastData";

export default function PodcastPlayer({ episodes }: { episodes: PodcastEpisode[] }) {
  const [selectedEp, setSelectedEp] = useState<PodcastEpisode | null>(episodes[0] ?? null);

  if (!selectedEp) {
    return (
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 text-center">
        <p className="text-sm font-semibold text-[#16233A]">Aucun épisode publié pour le moment</p>
        <p className="text-xs text-[#5C6672] mt-1">Le prochain épisode du Let&apos;s Talk Podcast arrive bientôt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Featured Player Card */}
      <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-[#DCD7CB]/50 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Video / YouTube Screen */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-video w-full rounded-lg sm:rounded-xl overflow-hidden bg-black border border-[#DCD7CB]/60 shadow-sm group">
              <iframe
                key={selectedEp.id}
                src={`https://www.youtube.com/embed/${selectedEp.youtubeId}?rel=0&playsinline=1`}
                title={selectedEp.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs bg-[#F7F5F0]/80 border border-[#DCD7CB]/40 rounded-lg px-3 py-2 text-[#5C6672]">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1 font-medium text-[#3D4A58]">
                  <Calendar className="w-3.5 h-3.5 text-[#755B18]" />
                  <span>{selectedEp.releaseDate}</span>
                </span>
                <span className="flex items-center gap-1 font-medium text-[#3D4A58]">
                  <Clock className="w-3.5 h-3.5 text-[#755B18]" />
                  <span>{selectedEp.duration}</span>
                </span>
                {selectedEp.views && (
                  <span className="flex items-center gap-1 font-medium text-[#3D4A58]">
                    <Eye className="w-3.5 h-3.5 text-[#755B18]" />
                    <span>{selectedEp.views} vues</span>
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 font-semibold text-[#755B18]">
                <Award className="w-3.5 h-3.5" />
                <span>Sponsor: {selectedEp.sponsor}</span>
              </span>
            </div>
          </div>

          {/* Episode Info & Synopsis */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-[#755B18]/15 text-[#755B18] border border-[#755B18]/30">
                <span>Épisode {selectedEp.episodeNumber}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-[#16233A] leading-tight tracking-tight">
                {selectedEp.guest}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#755B18] leading-snug">
                {selectedEp.role}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed">
              {selectedEp.synopsis}
            </p>

            {/* Key Clinical & Academic Takeaways */}
            <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-[#DCD7CB]/30">
              <h4 className="text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider text-[#3D4A58]">
                Points Clés & Enseignements
              </h4>
              <ul className="space-y-1.5">
                {selectedEp.takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#3D4A58] leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#755B18] shrink-0 mt-0.5" />
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
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm"
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
        <h3 className="text-base sm:text-lg font-heading font-bold text-[#16233A] flex items-center gap-2">
          <span>Tous les Épisodes Let&apos;s Talk</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          {episodes.map((ep) => {
            const isCurrent = selectedEp.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => setSelectedEp(ep)}
                className={`text-left p-2.5 sm:p-4 rounded-xl sm:rounded-lg border transition-all duration-200 flex items-center gap-3 group ${
                  isCurrent
                    ? "bg-[#EFECE4] border-[#755B18] shadow-lg shadow-[#755B18]/10"
                    : "glass-card hover:border-[#DCD7CB] hover:bg-[#EFECE4]/40"
                }`}
              >
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-[#DCD7CB]/50">
                  <Image
                    src={ep.posterImage}
                    alt={ep.guest}
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-[#16233A] fill-current opacity-80" />
                  </div>
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#755B18] block">
                    ÉPISODE {ep.episodeNumber}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#16233A] truncate">
                    {ep.guest}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-[#5C6672] truncate">{ep.releaseDate}</p>
                </div>

                <ChevronRight className={`w-3.5 h-3.5 text-[#5C6672] transition-transform shrink-0 ${isCurrent ? "text-[#755B18] translate-x-0.5" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
