import React from "react";
import Hero from "@/components/Hero";
import HomeContent from "@/components/home/HomeContent";
import NextAtelierTeaser from "@/components/home/NextAtelierTeaser";
import { siteConfig } from "@/data/siteConfig";
import { getSiteSettings, getTedxTalks, getPodcastEpisodes, getPublishedAnnouncements } from "@/lib/data";

export default async function HomePage() {
  const [settings, talks, episodes, announcements] = await Promise.all([
    getSiteSettings(),
    getTedxTalks(),
    getPodcastEpisodes(),
    getPublishedAnnouncements(),
  ]);

  const featuredEpisode = episodes[0] ?? null;

  // Next upcoming atelier (earliest future event_date); silent-hidden if none.
  const upcoming = announcements
    .filter((a) => a.kind === "atelier" && a.event_date && new Date(a.event_date).getTime() >= Date.now())
    .sort((a, b) => (a.event_date ?? "").localeCompare(b.event_date ?? ""))[0];

  const stats = settings.home_stats ?? siteConfig.stats;

  return (
    <div className="space-y-8 sm:space-y-14 pb-6 sm:pb-10">
      {/* 1. Hero Banner with Latest Podcast Showcase */}
      <Hero
        eventsVisible={settings.events_visible}
        featuredEpisode={featuredEpisode}
        marqueeLine={settings.marquee_line}
        tagline={settings.hero_tagline}
      />

      {/* 2. Prochain atelier teaser (hidden when the board has none) */}
      {upcoming && <NextAtelierTeaser atelier={upcoming} />}

      {/* 2b. Le club en chiffres (console-edited, static fallback) */}
      {stats.length > 0 && (
        <section aria-label="Le club en chiffres" className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-lg border border-[#DCD7CB]/40 p-3 sm:p-4 text-center"
              >
                <p className="text-lg sm:text-2xl font-heading font-bold text-[#755B18] tabular-nums leading-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-[#5C6672] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Interactive DB-driven sections */}
      <HomeContent
        talks={talks}
        eventsVisible={settings.events_visible}
        highlightKicker={settings.highlight_kicker}
        highlightDate={settings.highlight_date}
        activityImages={settings.activity_card_images}
      />
    </div>
  );
}
