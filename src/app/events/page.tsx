import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, BookOpen, ArrowRight } from "lucide-react";
import TedxGrid from "@/components/events/TedxGrid";
import { getSiteSettings, getTedxTalks, getPublishedEventSlugs, getEventPage } from "@/lib/data";
import type { EventPage, EventPageItem } from "@/lib/types";
import Reveal from "@/components/Reveal";

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
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-14">
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">
          Événements, TEDx &amp; Éloquence
        </p>
        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-[#16233A] tracking-tight">
          La Scène des Idées &amp; des Débats
        </h1>
        <p className="text-xs sm:text-base text-[#5C6672] leading-relaxed">
          De l&apos;amphithéâtre du TEDxFMDC aux joutes oratoires des Débats en Table, explorez les
          prises de parole marquantes de nos étudiants.
        </p>
      </div>

      {/* Upcoming event landing pages (admin-created) */}
      {eventPages.length > 0 && (
        <Reveal>
        <section className="space-y-3 sm:space-y-5">
          <div className="flex items-end justify-between border-b border-[#DCD7CB]/30 pb-3">
            <h2 className="text-lg sm:text-2xl font-heading font-bold text-[#16233A]">
              Événements à venir
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {eventPages.map(({ page }) => (
              <Link
                key={page.id}
                href={`/events/${page.slug}`}
                className="glass-card glass-card-hover rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/40 group flex flex-col"
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
                    <h3 className="text-sm sm:text-base font-heading font-bold text-[#16233A] group-hover:text-[#755B18] transition-colors">
                      {page.title}
                    </h3>
                    {page.tagline && (
                      <p className="text-[11px] sm:text-xs text-[#5C6672] line-clamp-2">{page.tagline}</p>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#755B18] flex items-center gap-1 pt-2">
                    <span>Découvrir l&apos;événement</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        </Reveal>
      )}

      {/* 1. TEDxFMDC talks (DB-driven, interactive) */}
      {talks.length > 0 && <TedxGrid talks={talks} />}

      {/* 2. Débats en Table Section */}
      <Reveal>
      <section className="glass-card p-4 sm:p-10 rounded-lg border border-[#DCD7CB]/40 space-y-4 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
          <div className="lg:col-span-6 space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFECE4] text-[#755B18] border border-[#DCD7CB]/40">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tournois Parlementaires</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-[#16233A]">
              Débats en Table Dentalk
            </h2>
            <p className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed">
              Format d&apos;éloquence structuré opposant deux équipes sur des thématiques éthiques,
              médicales et philosophiques selon les règles du débat contradictoire universitaire.
            </p>
            <div className="space-y-1.5 text-[11px] sm:text-xs text-[#5C6672]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#755B18]" />
                <span>Format officiel en 3 sections linguistiques (Français, Anglais, Arabe)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#755B18]" />
                <span>Évaluation sur la clarté argumentative, l&apos;écoute et la conviction</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/50">
              <Image
                src="/media/events/debate_table_session.jpg"
                alt="Session de Débat"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/50">
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
      </Reveal>

      {/* 3. Workshops & Masterclasses */}
      <Reveal>
      <section className="glass-card p-4 sm:p-10 rounded-lg border border-[#DCD7CB]/40 space-y-4 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/50">
              <Image
                src="/media/events/eloquence_workshop.jpg"
                alt="Atelier d'éloquence"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-lg overflow-hidden border border-[#DCD7CB]/50">
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFECE4] text-[#755B18] border border-[#DCD7CB]/40">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Formation & Soft Skills</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-[#16233A]">
              Ateliers de Prise de Parole
            </h2>
            <p className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed">
              Sessions régulières en Salle Vésale pour surmonter le trac, structurer un pitch
              percutant et maîtriser la rhétorique.
            </p>
            <div className="space-y-1.5 text-[11px] sm:text-xs text-[#5C6672]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#755B18]" />
                <span>Exercices de rhétorique et gestion du langage non-verbal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#755B18]" />
                <span>Préparation aux examens oraux et stages hospitaliers</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Reveal>
    </div>
  );
}
