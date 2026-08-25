"use client";

import React, { useState } from "react";
import Image from "next/image";
import { tedxTalksData, TedxTalk } from "@/data/tedxData";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import { Play, Sparkles, MessageSquare, BookOpen, Calendar } from "lucide-react";

export default function EventsPage() {
  const [activeTalk, setActiveTalk] = useState<TedxTalk | null>(null);

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-20">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Événements, TEDx & Éloquence</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-heading font-extrabold text-white">
          La Scène des Idées & des <span className="gold-gradient-text">Débats</span>
        </h1>
        <p className="text-xs sm:text-base text-[#94A3B8] leading-relaxed">
          De l&apos;amphithéâtre du TEDxFMDC aux joutes oratoires des Débats en Table, explorez les prises de parole marquantes de nos étudiants.
        </p>
      </div>

      {/* 1. TEDxFMDC Full 8 Video Reels Section */}
      <section className="space-y-4 sm:space-y-8">
        <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 relative overflow-hidden space-y-4 sm:space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 border-b border-[#385A75]/30 pb-4 sm:pb-6">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                Première Édition Historique · 22 Nov 2025
              </span>
              <h2 className="text-xl sm:text-3xl font-heading font-bold text-white">
                TEDxFMDC — Les 8 Talks Officiels
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
                  8 Orateurs Étudiants · Extraits Vidéo Officiels
                </h3>
              </div>
            </div>
          </div>

          {/* The 8 Video Reel Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 pt-2 sm:pt-4">
            {tedxTalksData.map((talk) => (
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
                    Extrait {talk.extractNumber}/8
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
      </section>

      {/* 2. Débats en Table Section */}
      <section className="glass-card p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 space-y-4 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
          <div className="lg:col-span-6 space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1B2E4B] text-[#D4AF37] border border-[#385A75]/40">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tournois Parlementaires</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-white">
              Débats en Table Dentalk
            </h2>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              Format d&apos;éloquence structuré opposant deux équipes sur des thématiques éthiques, médicales et philosophiques selon les règles du débat contradictoire universitaire.
            </p>
            <div className="space-y-1.5 text-[11px] sm:text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Format officiel en 3 sections linguistiques (Français, Anglais, Arabe)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Évaluation sur la clarté argumentative, l&apos;écoute et la conviction</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/50">
              <Image
                src="/media/events/debate_table_session.jpg"
                alt="Session de Débat"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/50">
              <Image
                src="/media/events/debate_roundtable.jpg"
                alt="Table Ronde"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workshops & Masterclasses */}
      <section className="glass-card p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 space-y-4 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/50">
              <Image
                src="/media/events/eloquence_workshop.jpg"
                alt="Atelier d'éloquence"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/50">
              <Image
                src="/media/events/eloquence_keynote_stage.jpg"
                alt="Discours en amphithéâtre"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1B2E4B] text-[#D4AF37] border border-[#385A75]/40">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Formation & Soft Skills</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-white">
              Ateliers de Prise de Parole
            </h2>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              Sessions régulières en Salle Vésale pour surmonter le trac, structurer un pitch percutant et maîtriser la rhétorique.
            </p>
            <div className="space-y-1.5 text-[11px] sm:text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Exercices de rhétorique et gestion du langage non-verbal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Préparation aux examens oraux et stages hospitaliers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoPlayerModal talk={activeTalk} onClose={() => setActiveTalk(null)} />
    </div>
  );
}
