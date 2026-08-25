import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays } from "lucide-react";
import EventItemsGrid from "@/components/events/EventItemsGrid";
import { getEventPage, getSiteSettings } from "@/lib/data";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEventPage(slug);
  if (!result) return { title: "Événement introuvable" };
  const { page } = result;
  return {
    title: page.title,
    description: page.tagline || page.description.slice(0, 150),
    alternates: {
      canonical: `/events/${page.slug}`,
    },
    openGraph: page.hero_poster
      ? {
          title: page.title,
          description: page.tagline || undefined,
          images: [{ url: page.hero_poster }],
        }
      : undefined,
    twitter: page.hero_poster
      ? {
          card: "summary_large_image",
          title: page.title,
          description: page.tagline || undefined,
          images: [page.hero_poster],
        }
      : undefined,
  };
}

export default async function EventLandingPage({ params }: Params) {
  const { slug } = await params;
  // Event pages live under the events section: honor its visibility setting.
  const [settings, result] = await Promise.all([getSiteSettings(), getEventPage(slug)]);
  if (!settings.events_visible || !result) {
    notFound();
  }
  const { page, items } = result;

  return (
    <div className="pb-10 sm:pb-20">
      {/* Hero (aspect-based height: no artificial viewport sizing on mobile) */}
      <header className="relative w-full aspect-[16/11] sm:aspect-[21/9] min-h-[320px] sm:min-h-[420px] flex items-end bg-[#0B132B]">
        {page.hero_poster && (
          <>
            <Image
              src={page.hero_poster}
              alt={page.title}
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent" />
          </>
        )}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pb-8 sm:pb-14 space-y-3 pt-28">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#94A3B8] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tous les événements</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Événement DTC</span>
          </div>
          <h1 className="text-3xl sm:text-6xl font-heading font-extrabold text-white leading-tight">
            {page.title}
          </h1>
          {page.tagline && (
            <p className="text-sm sm:text-xl text-[#CBD5E1] max-w-3xl leading-relaxed">{page.tagline}</p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-14 pt-8 sm:pt-12">
        {/* Description */}
        {page.description && (
          <section className="glass-card p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 max-w-4xl mx-auto">
            <p className="text-xs sm:text-base text-[#CBD5E1] leading-relaxed whitespace-pre-line">
              {page.description}
            </p>
          </section>
        )}

        {/* Talks / videos */}
        {items.length > 0 && (
          <section className="space-y-4 sm:space-y-8">
            <div className="border-b border-[#385A75]/30 pb-3 sm:pb-4">
              <h2 className="text-xl sm:text-3xl font-heading font-bold text-white">
                Programmation & <span className="gold-gradient-text">Vidéos</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                {items.length} intervention{items.length > 1 ? "s" : ""} — cliquez pour lancer la vidéo.
              </p>
            </div>
            <EventItemsGrid items={items} />
          </section>
        )}
      </div>
    </div>
  );
}
