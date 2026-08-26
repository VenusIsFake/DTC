"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import Reveal from "@/components/Reveal";
import type { TedxTalk } from "@/data/tedxData";
import type { PodcastEpisode } from "@/data/podcastData";
import { siteConfig } from "@/data/siteConfig";
import { Play, Mic, ArrowRight, ExternalLink } from "lucide-react";

/**
 * Interactive home sections (TEDx spotlight, podcast banner, activity grid,
 * CTA). Data arrives via props from the server page (DB with static fallback).
 */
export default function HomeContent({
  talks,
  featuredEpisode,
  eventsVisible,
}: {
  talks: TedxTalk[];
  featuredEpisode: PodcastEpisode | null;
  eventsVisible: boolean;
}) {
  const [activeTalk, setActiveTalk] = useState<TedxTalk | null>(null);

  return (
    <>
      {/* 3. TEDxFMDC Video Spotlight Section */}
      {eventsVisible && talks.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#DCD7CB] pb-5">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8A6D1F]">
                Événement phare · 22 Nov 2025
              </p>
              <h2 className="font-heading font-semibold text-2xl sm:text-4xl text-[#16233A] tracking-tight">
                Talks &amp; Reels TEDxFMDC
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6672] max-w-xl">
                Revivez les extraits vidéo officiels des {talks.length} orateurs étudiants lors du TEDx à
                l&apos;amphithéâtre.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#16233A] border-b border-[#8A6D1F] pb-0.5 hover:text-[#8A6D1F] transition-colors shrink-0"
            >
              <span>Tous les extraits ({talks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Featured TEDx Talk Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {talks.slice(0, 3).map((talk, idx) => (
              <Reveal key={talk.id} delay={idx * 90} className="flex flex-col">
              <div
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
                className="glass-card glass-card-hover rounded-lg overflow-hidden flex flex-col group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6D1F] flex-1"
              >
                {/* Poster Screen */}
                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-black">
                  <Image
                    src={talk.posterUrl}
                    alt={talk.topic}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#D4AF37] text-[#16233A] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-black/70 text-[#F7F5F0]">
                    Extrait {talk.extractNumber}/{talks.length}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-black/70 text-[#F7F5F0]">
                    {talk.duration}
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#8A6D1F]">
                      {talk.speaker}
                    </span>
                    <h3 className="text-sm sm:text-base font-heading font-semibold text-[#16233A] group-hover:text-[#8A6D1F] transition-colors line-clamp-2">
                      {talk.topic}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5C6672] line-clamp-2">
                      {talk.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] sm:text-xs text-[#7A828D] border-t border-[#DCD7CB]">
                    <span>Amphithéâtre FMDC</span>
                    <span className="text-[#8A6D1F] font-medium flex items-center gap-1">
                      Regarder <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 4. Let's Talk Podcast Featured Banner */}
      {featuredEpisode && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
          <div className="bg-white border border-[#DCD7CB] rounded-lg p-5 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-red-700">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Let&apos;s Talk Podcast · Épisode {featuredEpisode.episodeNumber}</span>
                </p>

                <h2 className="font-heading font-semibold text-xl sm:text-4xl text-[#16233A] leading-tight tracking-tight">
                  Rencontre avec {featuredEpisode.guest}
                </h2>

                <p className="text-xs sm:text-base text-[#3D4A58] leading-relaxed">
                  {featuredEpisode.synopsis}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Link
                    href="/podcast"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md font-semibold text-xs sm:text-sm bg-[#16233A] text-[#F7F5F0] hover:bg-[#233753] transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Écouter l&apos;épisode</span>
                  </Link>

                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#5C6672] font-medium">
                    <span>Co-produit avec le CSD</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-[#DCD7CB] group">
                  <Image
                    src={featuredEpisode.posterImage}
                    alt={featuredEpisode.guest}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Link
                      href="/podcast"
                      aria-label={`Écouter l'épisode avec ${featuredEpisode.guest}`}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Reveal>
        </section>
      )}

      {/* 5. Activities & Debates Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        <div className="max-w-2xl space-y-1.5">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8A6D1F]">
            Nos pôles d&apos;activité
          </p>
          <h2 className="font-heading font-semibold text-2xl sm:text-4xl text-[#16233A] tracking-tight">
            L&apos;écosystème Dentalk Club
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6672]">
            Des initiatives régulières pour forger l&apos;éloquence, l&apos;esprit critique et la
            fraternité étudiante.
          </p>
        </div>

        <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Debates */}
          <div className="glass-card p-4 sm:p-5 rounded-lg space-y-3">
            <div className="relative aspect-video rounded-md overflow-hidden border border-[#DCD7CB]">
              <Image
                src="/media/events/debate_table_session.jpg"
                alt="Débats en Table"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-semibold text-[#16233A]">
              Débats en Table Dentalk
            </h3>
            <p className="text-[11px] sm:text-xs text-[#5C6672] leading-relaxed">
              Joutes oratoires et tournois parlementaires structurés autour de thématiques médicales, sociétales et éthiques.
            </p>
            <Link
              href={eventsVisible ? "/events" : "/annonces"}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#8A6D1F] hover:text-[#16233A]"
            >
              <span>{eventsVisible ? "Découvrir les formats" : "Voir les annonces"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 2: Workshops */}
          <div className="glass-card p-4 sm:p-5 rounded-lg space-y-3">
            <div className="relative aspect-video rounded-md overflow-hidden border border-[#DCD7CB]">
              <Image
                src="/media/events/eloquence_workshop.jpg"
                alt="Ateliers d'Éloquence"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-semibold text-[#16233A]">
              Ateliers Pratiques &amp; Masterclasses
            </h3>
            <p className="text-[11px] sm:text-xs text-[#5C6672] leading-relaxed">
              Sessions hebdomadaires en Salle Vésale axées sur le langage corporel, la gestion du stress et la rhétorique.
            </p>
            <Link
              href="/annonces"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#8A6D1F] hover:text-[#16233A]"
            >
              <span>Voir les ateliers</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3: Team Life */}
          <div className="glass-card p-4 sm:p-5 rounded-lg space-y-3">
            <div className="relative aspect-video rounded-md overflow-hidden border border-[#DCD7CB]">
              <Image
                src="/media/team/outdoor_retreat.jpg"
                alt="Vie du Club"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-semibold text-[#16233A]">
              Vie du Club &amp; Sorties Cohésion
            </h3>
            <p className="text-[11px] sm:text-xs text-[#5C6672] leading-relaxed">
              Journées de cohésion, assemblées générales et galas marquant les transitions de mandats et l&apos;esprit de famille DTC.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#8A6D1F] hover:text-[#16233A]"
            >
              <span>Rencontrer l&apos;équipe</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        </Reveal>
      </section>

      {/* 6. Join CTA Band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
        <div className="bg-[#16233A] rounded-lg px-6 sm:px-12 py-8 sm:py-12 text-center space-y-4">
          <h2 className="font-heading font-semibold text-xl sm:text-4xl text-[#F7F5F0] tracking-tight">
            Prêt à faire entendre votre voix&nbsp;?
          </h2>
          <p className="text-xs sm:text-sm text-[#AEB6C2] max-w-xl mx-auto leading-relaxed">
            Rejoignez le Dentalk Club FMDC et participez aux prochaines sessions de débats, formations
            d&apos;éloquence et tournages podcasts.
          </p>
          <div className="pt-2">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-md font-bold text-xs sm:text-sm bg-[#D4AF37] text-[#16233A] hover:bg-[#E3C45B] transition-colors"
            >
              <span>Rejoindre via Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Video Modal Hook */}
      <VideoPlayerModal talk={activeTalk} onClose={() => setActiveTalk(null)} />
    </>
  );
}
