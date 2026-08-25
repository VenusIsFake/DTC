"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import type { TedxTalk } from "@/data/tedxData";
import type { PodcastEpisode } from "@/data/podcastData";
import { siteConfig } from "@/data/siteConfig";
import { Play, Mic, ArrowRight, Sparkles, MessageSquare, Award, ExternalLink } from "lucide-react";

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
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4 border-b border-[#385A75]/30 pb-4 sm:pb-6">
            <div className="space-y-1 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                <Sparkles className="w-3 h-3" />
                <span>Événement Phare · 22 Nov 2025</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
                Talks & Reels <span className="gold-gradient-text">TEDxFMDC</span>
              </h2>
              <p className="text-xs sm:text-base text-[#94A3B8] max-w-xl">
                Revivez les extraits vidéo officiels des {talks.length} orateurs étudiants lors du TEDx à
                l&apos;amphithéâtre.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#D4AF37] hover:text-[#F59E0B] transition-colors"
            >
              <span>Voir tous les {talks.length} extraits vidéo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Featured TEDx Talk Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {talks.slice(0, 3).map((talk) => (
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
                {/* Poster Screen */}
                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-black">
                  <Image
                    src={talk.posterUrl}
                    alt={talk.topic}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#D4AF37] text-[#0B132B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-[#D4AF37] backdrop-blur-md border border-[#D4AF37]/30">
                    Extrait {talk.extractNumber}/{talks.length}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-md">
                    {talk.duration}
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#D4AF37]">
                      {talk.speaker}
                    </span>
                    <h3 className="text-sm sm:text-base font-heading font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {talk.topic}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#94A3B8] line-clamp-2">
                      {talk.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] sm:text-xs text-[#64748B] border-t border-[#385A75]/20">
                    <span>Amphithéâtre FMDC</span>
                    <span className="text-[#D4AF37] font-medium flex items-center gap-1">
                      Regarder <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Let's Talk Podcast Featured Banner */}
      {featuredEpisode && (
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-12 border border-[#385A75]/50 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-3 sm:space-y-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                  <Mic className="w-3 h-3 text-red-400" />
                  <span>Let&apos;s Talk Podcast · Épisode {featuredEpisode.episodeNumber}</span>
                </div>

                <h2 className="text-xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  Rencontre avec le <span className="gold-gradient-text">{featuredEpisode.guest}</span>
                </h2>

                <p className="text-xs sm:text-base text-[#CBD5E1] leading-relaxed">
                  {featuredEpisode.synopsis}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
                  <Link
                    href="/podcast"
                    className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Écouter l&apos;épisode</span>
                  </Link>

                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#94A3B8] font-medium">
                    <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Co-produit avec le CSD</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/50 shadow-2xl group">
                  <Image
                    src={featuredEpisode.posterImage}
                    alt={featuredEpisode.guest}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Link
                      href="/podcast"
                      aria-label={`Écouter l'épisode avec ${featuredEpisode.guest}`}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Activities & Debates Highlights */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1B2E4B] text-[#D4AF37] border border-[#385A75]/50">
            <MessageSquare className="w-3 h-3" />
            <span>Nos Pôles d&apos;Activités</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
            L&apos;Écosystème <span className="gold-gradient-text">Dentalk Club</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Des initiatives régulières pour forger l&apos;éloquence, l&apos;esprit critique et la fraternité étudiante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          {/* Card 1: Debates */}
          <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#385A75]/30 space-y-3 sm:space-y-4">
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border border-[#385A75]/40">
              <Image
                src="/media/events/debate_table_session.jpg"
                alt="Débats en Table"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-white">
              Débats en Table Dentalk
            </h3>
            <p className="text-[11px] sm:text-xs text-[#94A3B8] leading-relaxed">
              Joutes oratoires et tournois parlementaires structurés autour de thématiques médicales, sociétales et éthiques.
            </p>
            <Link
              href={eventsVisible ? "/events" : "/annonces"}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#D4AF37] hover:text-[#F59E0B]"
            >
              <span>{eventsVisible ? "Découvrir les formats" : "Voir les annonces"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 2: Workshops */}
          <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#385A75]/30 space-y-3 sm:space-y-4">
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border border-[#385A75]/40">
              <Image
                src="/media/events/eloquence_workshop.jpg"
                alt="Ateliers d'Éloquence"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-white">
              Ateliers Pratiques & Masterclasses
            </h3>
            <p className="text-[11px] sm:text-xs text-[#94A3B8] leading-relaxed">
              Sessions hebdomadaires en Salle Vésale axées sur le langage corporel, la gestion du stress et la rhétorique.
            </p>
            <Link
              href="/annonces"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#D4AF37] hover:text-[#F59E0B]"
            >
              <span>Voir les ateliers</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3: Team Life */}
          <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#385A75]/30 space-y-3 sm:space-y-4">
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border border-[#385A75]/40">
              <Image
                src="/media/team/outdoor_retreat.jpg"
                alt="Vie du Club"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-white">
              Vie du Club & Sorties Cohésion
            </h3>
            <p className="text-[11px] sm:text-xs text-[#94A3B8] leading-relaxed">
              Journées de cohésion, assemblées générales et galas marquant les transitions de mandats et l&apos;esprit de famille DTC.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#D4AF37] hover:text-[#F59E0B]"
            >
              <span>Rencontrer l&apos;équipe</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Join CTA Box */}
      <section className="max-w-4xl mx-auto px-3.5 text-center">
        <div className="glass-card p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#D4AF37]/40 shadow-2xl space-y-4 sm:space-y-6 relative overflow-hidden">
          <div className="inline-flex p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-4xl font-heading font-extrabold text-white">
            Prêt à faire entendre votre voix ?
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl mx-auto leading-relaxed">
            Rejoignez le Dentalk Club FMDC et participez aux prochaines sessions de débats, formations
            d&apos;éloquence et tournages podcasts.
          </p>
          <div className="pt-1 sm:pt-2">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95"
            >
              <span>Rejoindre via Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Video Modal Hook */}
      <VideoPlayerModal talk={activeTalk} onClose={() => setActiveTalk(null)} />
    </>
  );
}
