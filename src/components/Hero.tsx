"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Radio, Calendar, Eye } from "lucide-react";
import type { PodcastEpisode } from "@/data/podcastData";

export default function Hero({
  eventsVisible = true,
  featuredEpisode,
}: {
  eventsVisible?: boolean;
  featuredEpisode?: PodcastEpisode | null;
}) {
  const [imgSrc, setImgSrc] = useState(
    featuredEpisode?.posterImage ||
      (featuredEpisode?.episodeNumber
        ? `/media/podcasts/youtube_thumb_ep${featuredEpisode.episodeNumber}.jpg`
        : "/media/podcasts/youtube_thumb_ep4.jpg")
  );

  if (!featuredEpisode) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-0">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card p-4 sm:p-7 lg:p-9 rounded-2xl sm:rounded-3xl border border-[#DCD7CB]/60 shadow-sm space-y-4 sm:space-y-6 group">
          {/* Card Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCD7CB]/40 pb-3 sm:pb-4">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-red-700 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <Radio className="w-4 h-4" />
              <span>Dernière Sortie · Épisode {featuredEpisode.episodeNumber}</span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-[#5C6672] font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFECE4]/70 border border-[#DCD7CB]/40 text-[#16233A] font-semibold">
                <Eye className="w-3.5 h-3.5 text-[#755B18]" />
                <span>{featuredEpisode.views || "1.4k"} vues</span>
              </span>

              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#755B18]" />
                <span>{featuredEpisode.releaseDate}</span>
              </span>
            </div>
          </div>

          {/* Card Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
            {/* Widescreen 16:9 Thumbnail */}
            <div className="lg:col-span-7">
              <Link
                href="/podcast"
                className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black/90 border border-[#DCD7CB]/60 shadow-md group/thumb block"
              >
                <Image
                  src={imgSrc}
                  alt={featuredEpisode.guest}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  onError={() =>
                    setImgSrc(
                      `/media/podcasts/youtube_thumb_ep${featuredEpisode.episodeNumber}.jpg`
                    )
                  }
                  className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/15 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/95 text-red-600 shadow-xl backdrop-blur-sm flex items-center justify-center group-hover/thumb:scale-110 group-hover/thumb:bg-red-600 group-hover/thumb:text-white transition-all">
                    <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/85 text-white text-xs font-semibold flex items-center gap-1.5 shadow backdrop-blur-sm">
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{featuredEpisode.views || "1.4k"} vues</span>
                </div>

                {featuredEpisode.duration && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/85 text-white text-xs font-semibold tabular-nums leading-none shadow backdrop-blur-sm">
                    {featuredEpisode.duration}
                  </div>
                )}
              </Link>
            </div>

            {/* Episode Details */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-1.5">
                <span className="inline-block text-[11px] sm:text-xs font-bold text-[#755B18] uppercase tracking-wider">
                  Let&apos;s Talk Podcast
                </span>
                <h2 className="text-xl sm:text-3xl font-heading font-semibold text-[#16233A] leading-tight tracking-tight">
                  {featuredEpisode.guest}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#755B18] leading-snug">
                  {featuredEpisode.role}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed line-clamp-3 sm:line-clamp-4">
                {featuredEpisode.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/podcast"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-[#16233A] text-[#F7F5F0] hover:bg-[#233753] transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Écouter l&apos;épisode</span>
                </Link>

                <Link
                  href={eventsVisible ? "/events" : "/annonces"}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm text-[#16233A] bg-[#EFECE4]/60 border border-[#DCD7CB] hover:bg-[#EFECE4] transition-colors"
                >
                  <span>{eventsVisible ? "TEDxFMDC" : "Ateliers"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
