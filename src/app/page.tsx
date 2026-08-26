import React from "react";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
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
  const stats = settings.home_stats ?? siteConfig.stats;

  // Next upcoming atelier (earliest future event_date); silent-hidden if none.
  const upcoming = announcements
    .filter((a) => a.kind === "atelier" && a.event_date && new Date(a.event_date).getTime() >= Date.now())
    .sort((a, b) => (a.event_date ?? "").localeCompare(b.event_date ?? ""))[0];

  return (
    <div className="space-y-8 sm:space-y-14 pb-6 sm:pb-10">
      {/* 1. Hero Banner */}
      <Hero eventsVisible={settings.events_visible} />

      {/* 2. Prochain atelier teaser (hidden when the board has none) */}
      {upcoming && <NextAtelierTeaser atelier={upcoming} />}

      {/* 3. Live Statistics Strip */}
      <StatsCounter stats={stats} />

      {/* 4+. Interactive DB-driven sections */}
      <HomeContent talks={talks} featuredEpisode={featuredEpisode} eventsVisible={settings.events_visible} />
    </div>
  );
}
