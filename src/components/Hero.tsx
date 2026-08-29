"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mic, Play, Radio, Calendar } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import type { PodcastEpisode } from "@/data/podcastData";

export default function Hero({
  eventsVisible = true,
  featuredEpisode,
}: {
  eventsVisible?: boolean;
  featuredEpisode?: PodcastEpisode | null;
}) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12 pb-0">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* Club Intro Text Column */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">
          <div>
            <h1 className="font-heading font-semibold text-4xl sm:text-6xl lg:text-[4.25rem] text-[#16233A] leading-[1.05] tracking-tight">
              Dentalk Club
            </h1>

            <p className="mt-3 sm:mt-4 font-heading italic text-lg sm:text-2xl text-[#3D4A58]">
              &laquo;&nbsp;{siteConfig.tagline}&nbsp;&raquo;
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
            <Link
              href={eventsVisible ? "/events" : "/annonces"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#16233A] text-[#F7F5F0] hover:bg-[#233753] transition-all shadow-sm"
            >
              <span>{eventsVisible ? "TEDxFMDC" : "Ateliers"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/podcast"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-[#16233A] bg-[#EFECE4]/60 border border-[#DCD7CB] hover:bg-[#EFECE4] transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-[#755B18]" />
              <span>Podcast Let&apos;s Talk</span>
            </Link>
          </div>
        </div>

        {/* Latest Event / Podcast Showcase Card */}
        <div className="lg:col-span-7">
          {featuredEpisode ? (
            <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#DCD7CB]/60 shadow-sm space-y-3.5 group">
              {/* Card Header Tag */}
              <div className="flex items-center justify-between gap-2 border-b border-[#DCD7CB]/40 pb-3">
                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <Radio className="w-3.5 h-3.5" />
                  <span>Dernière Sortie · Épisode {featuredEpisode.episodeNumber}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#5C6672] font-medium">
                  <Calendar className="w-3 h-3 text-[#755B18]" />
                  <span>{featuredEpisode.releaseDate}</span>
                </div>
              </div>

              {/* Card Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Poster / Video Thumbnail */}
                <Link
                  href="/podcast"
                  className="sm:col-span-5 relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black border border-[#DCD7CB]/50 group/thumb block"
                >
                  <Image
                    src={featuredEpisode.posterImage}
                    alt={featuredEpisode.guest}
                    fill
                    sizes="(max-width: 640px) 100vw, 240px"
                    className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                      <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current translate-x-0.5" />
                    </div>
                  </div>
                </Link>

                {/* Episode Details */}
                <div className="sm:col-span-7 space-y-1.5 sm:space-y-2">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg font-heading font-semibold text-[#16233A] leading-tight group-hover:text-[#755B18] transition-colors">
                      {featuredEpisode.guest}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-[#755B18] line-clamp-1">
                      {featuredEpisode.role}
                    </p>
                  </div>

                  <p className="text-xs text-[#5C6672] leading-relaxed line-clamp-2">
                    {featuredEpisode.synopsis}
                  </p>

                  <div className="pt-1">
                    <Link
                      href="/podcast"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16233A] hover:text-[#755B18] transition-colors"
                    >
                      <span>Écouter & Découvrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <div className="relative w-48 aspect-square">
                <Image
                  src="/logo.png"
                  alt="Dentalk Club FMDC Logo"
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
