"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Radio, Calendar, Eye } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
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

  return (
    <section className="px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-6 pb-0">
      <div className="max-w-6xl mx-auto space-y-2.5 sm:space-y-4">
        {/* Cinematic Brand Header Lockup */}
        <div className="border-b border-[#DCD7CB]/50 pb-2.5 sm:pb-3.5 space-y-1.5 sm:space-y-2">
          {/* Editorial Marquee Line */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span className="w-6 sm:w-10 h-px bg-[#755B18]/70 shrink-0" />
            <span className="text-[10.5px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#755B18] font-mono">
              DTC PRESENTS TO YOU
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-[#755B18]/50 via-[#DCD7CB]/40 to-transparent" />
            <span className="text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C6672] font-mono shrink-0">
              FMDC Casablanca
            </span>
          </div>

          {/* Title & Slogan Row */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
            <h1 className="font-heading font-semibold text-3xl sm:text-4xl lg:text-5xl text-[#16233A] tracking-tight leading-tight">
              Dentalk <span className="text-[#755B18]">Club</span>
            </h1>

            <p className="font-heading italic text-xs sm:text-sm md:text-base text-[#3D4A58]">
              &laquo;&nbsp;{siteConfig.tagline}&nbsp;&raquo;
            </p>
          </div>
        </div>

        {/* Featured Dernière Sortie Spotlight Card (Mobile Optimized) */}
        {featuredEpisode && (
          <div className="glass-card p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-[#DCD7CB]/60 shadow-sm space-y-2.5 sm:space-y-3.5 group">
            {/* Card Header Bar */}
            <div className="flex items-center justify-between gap-1.5 border-b border-[#DCD7CB]/40 pb-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="sm:hidden">Dernière Sortie · Ép. {featuredEpisode.episodeNumber}</span>
                <span className="hidden sm:inline">Dernière Sortie · Épisode {featuredEpisode.episodeNumber}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-[#5C6672] font-medium shrink-0">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#EFECE4]/70 border border-[#DCD7CB]/40 text-[#16233A] font-semibold">
                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#755B18]" />
                  <span>{featuredEpisode.views || "1.4k"} vues</span>
                </span>

                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#755B18]" />
                  <span>{featuredEpisode.releaseDate}</span>
                </span>
              </div>
            </div>

            {/* Card Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-6 items-center">
              {/* Widescreen 16:9 Thumbnail */}
              <div className="lg:col-span-6">
                <Link
                  href="/podcast"
                  className="relative aspect-video w-full rounded-lg sm:rounded-xl overflow-hidden bg-black/90 border border-[#DCD7CB]/60 shadow-sm group/thumb block"
                >
                  <Image
                    src={imgSrc}
                    alt={featuredEpisode.guest}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    onError={() =>
                      setImgSrc(
                        `/media/podcasts/youtube_thumb_ep${featuredEpisode.episodeNumber}.jpg`
                      )
                    }
                    className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 text-red-600 shadow-lg backdrop-blur-sm flex items-center justify-center group-hover/thumb:scale-110 group-hover/thumb:bg-red-600 group-hover/thumb:text-white transition-all">
                      <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 px-1.5 sm:px-2 py-0.5 rounded bg-black/85 text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow backdrop-blur-sm">
                    <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D4AF37]" />
                    <span>{featuredEpisode.views || "1.4k"} vues</span>
                  </div>

                  {featuredEpisode.duration && (
                    <div className="absolute bottom-2 right-2 px-1.5 sm:px-2 py-0.5 rounded bg-black/85 text-white text-[10px] sm:text-[11px] font-semibold tabular-nums leading-none shadow backdrop-blur-sm">
                      {featuredEpisode.duration}
                    </div>
                  )}
                </Link>
              </div>

              {/* Episode Details */}
              <div className="lg:col-span-6 space-y-1.5 sm:space-y-2.5">
                <div className="space-y-0.5">
                  <span className="inline-block text-[9px] sm:text-[11px] font-bold text-[#755B18] uppercase tracking-wider">
                    Let&apos;s Talk Podcast
                  </span>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-heading font-semibold text-[#16233A] leading-snug tracking-tight">
                    {featuredEpisode.guest}
                  </h2>
                  <p className="text-[10.5px] sm:text-xs font-semibold text-[#755B18] line-clamp-1 sm:line-clamp-none">
                    {featuredEpisode.role}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {featuredEpisode.synopsis}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 pt-1">
                  <Link
                    href="/podcast"
                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs bg-[#16233A] text-[#F7F5F0] hover:bg-[#233753] transition-all shadow-sm text-center"
                  >
                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    <span className="sm:hidden">Écouter</span>
                    <span className="hidden sm:inline">Écouter l&apos;épisode</span>
                  </Link>

                  <Link
                    href={eventsVisible ? "/events" : "/annonces"}
                    className="inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs text-[#16233A] bg-[#EFECE4]/60 border border-[#DCD7CB] hover:bg-[#EFECE4] transition-colors text-center"
                  >
                    <span>{eventsVisible ? "TEDx & Débats" : "Annonces & Idées"}</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
