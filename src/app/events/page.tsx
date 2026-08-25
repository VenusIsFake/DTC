import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, MessageSquare, BookOpen, ArrowRight } from "lucide-react";
import TedxGrid from "@/components/events/TedxGrid";
import { getSiteSettings, getTedxTalks, getPublishedEventSlugs, getEventPage } from "@/lib/data";
import type { EventPage, EventPageItem } from "@/lib/types";

export default async function EventsPage() {
  // Hidden section = truly gone: server redirect (nav link & sitemap already
  // respect the same setting).
  const settings = await getSiteSettings();
  if (!settings.events_visible) {
    redirect("/");
  }

  const [talks, slugs] = await Promise.all([getTedxTalks(), getPublishedEventSlugs()]);
  const eventPages = (
    await Promise.all(slugs.map((slug) => getEventPage(slug)))
  ).filter((p): p is { page: EventPage; items: EventPageItem[] } => p !== null);

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
          De l&apos;amphithéâtre du TEDxFMDC aux joutes oratoires des Débats en Table, explorez les
          prises de parole marquantes de nos étudiants.
        </p>
      </div>

      {/* Upcoming event landing pages (admin-created) */}
      {eventPages.length > 0 && (
        <section className="space-y-3 sm:space-y-5">
          <div className="flex items-end justify-between border-b border-[#385A75]/30 pb-3">
            <h2 className="text-lg sm:text-2xl font-heading font-bold text-white">
              Événements <span className="gold-gradient-text">à venir</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {eventPages.map(({ page }) => (
              <Link
                key={page.id}
                href={`/events/${page.slug}`}
                className="glass-card glass-card-hover rounded-xl sm:rounded-2xl overflow-hidden border border-[#385A75]/40 group flex flex-col"
              >
                {page.hero_poster && (
                  <div className="relative aspect-[16/9] bg-black">
                    <Image
                      src={page.hero_poster}
                      alt={page.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-3.5 sm:p-5 space-y-1 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-heading font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                      {page.title}
                    </h3>
                    {page.tagline && (
                      <p className="text-[11px] sm:text-xs text-[#94A3B8] line-clamp-2">{page.tagline}</p>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#D4AF37] flex items-center gap-1 pt-2">
                    <span>Découvrir l&apos;événement</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 1. TEDxFMDC talks (DB-driven, interactive) */}
      {talks.length > 0 && <TedxGrid talks={talks} />}

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
              Format d&apos;éloquence structuré opposant deux équipes sur des thématiques éthiques,
              médicales et philosophiques selon les règles du débat contradictoire universitaire.
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
              Sessions régulières en Salle Vésale pour surmonter le trac, structurer un pitch
              percutant et maîtriser la rhétorique.
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
    </div>
  );
}
