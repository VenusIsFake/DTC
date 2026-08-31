import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  AboutSection,
  AnnouncementBoardItem,
  Committee,
  CommentBoardItem,
  EventPage,
  EventPageItem,
  GalleryImageRow,
  IdeaBoardItem,
  MandateWithMembers,
  Profile,
  SiteSettings,
  PodcastEpisodeRow,
  TedxTalkRow,
} from "@/lib/types";
import type { PodcastEpisode } from "@/data/podcastData";
import { podcastEpisodesData } from "@/data/podcastData";
import type { TedxTalk } from "@/data/tedxData";
import { tedxTalksData } from "@/data/tedxData";
import type { GalleryItem } from "@/data/galleryData";
import { galleryItemsData } from "@/data/galleryData";
import { youtubeWatchUrl } from "@/lib/format";

/**
 * Server-side data layer. Public pages try the database first and fall back
 * to the static `src/data` seeds when Supabase is unreachable or not
 * configured, so the public site can never blank out. A slow database (not
 * just a failing one) also falls back after the timeout below — visitors get
 * the static content fast instead of a multi-second streaming skeleton.
 */
const DB_TIMEOUT_MS = 4000;

async function withFallback<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    return await Promise.race([
      fetcher(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("db-timeout")), DB_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const FALLBACK_SETTINGS: SiteSettings = {
  events_visible: true,
  promo_years: [2024, 2025, 2026],
};

async function fetchSiteSettings(): Promise<SiteSettings> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return FALLBACK_SETTINGS;
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    const settings: SiteSettings = { ...FALLBACK_SETTINGS };
    for (const row of data ?? []) {
      const entry = row as { key: string; value: unknown };
      if (entry.key === "events_visible" && typeof entry.value === "boolean") {
        settings.events_visible = entry.value;
      }
      if (
        entry.key === "promo_years" &&
        Array.isArray(entry.value) &&
        entry.value.every((y) => typeof y === "number")
      ) {
        settings.promo_years = entry.value as number[];
      }
      if (entry.key === "home_stats" && Array.isArray(entry.value)) {
        const stats = entry.value.filter(
          (s): s is { value: string; label: string } =>
            typeof s === "object" && s !== null && "value" in s && "label" in s
        );
        if (stats.length > 0) settings.home_stats = stats;
      }
      if (typeof entry.value === "string" && entry.value.trim() !== "") {
        if (entry.key === "marquee_line") settings.marquee_line = entry.value.trim();
        if (entry.key === "hero_tagline") settings.hero_tagline = entry.value.trim();
        if (entry.key === "highlight_kicker") settings.highlight_kicker = entry.value.trim();
        if (entry.key === "highlight_date") settings.highlight_date = entry.value.trim();
        if (entry.key === "about_intro") settings.about_intro = entry.value.trim();
      }
      const asPartner = (v: unknown) =>
        typeof v === "object" && v !== null &&
        typeof (v as { name?: unknown }).name === "string" &&
        typeof (v as { tagline?: unknown }).tagline === "string"
          ? { name: (v as { name: string }).name, tagline: (v as { tagline: string }).tagline }
          : null;
      if (entry.key === "sponsor") settings.sponsor = asPartner(entry.value) ?? undefined;
      if (entry.key === "partner_club") settings.partner_club = asPartner(entry.value) ?? undefined;
      if (entry.key === "activity_card_images" && typeof entry.value === "object" && entry.value !== null) {
        const pick = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);
        const cards = entry.value as Record<string, unknown>;
        settings.activity_card_images = {
          debates: pick(cards.debates),
          workshops: pick(cards.workshops),
          team: pick(cards.team),
        };
      }
    }
    return settings;
  }, FALLBACK_SETTINGS);
}

// Memoized per request: the layout and several pages need the settings on
// every render — this collapses them into a single Supabase round-trip.
export const getSiteSettings = cache(fetchSiteSettings);

// ---------------------------------------------------------------------------
// Session (server components / route handlers)
// ---------------------------------------------------------------------------

export async function getServerProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.rpc("my_profile");
    return ((data as Profile[] | null) ?? [])[0] ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Announcements (published board with RSVP counts)
// ---------------------------------------------------------------------------

export async function getPublishedAnnouncements(): Promise<AnnouncementBoardItem[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("announcement_board")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AnnouncementBoardItem[];
  }, []);
}

// ---------------------------------------------------------------------------
// Ideas
// ---------------------------------------------------------------------------

export async function getIdeaBoard(): Promise<IdeaBoardItem[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("idea_board")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as IdeaBoardItem[];
  }, []);
}

// ---------------------------------------------------------------------------
// Podcast
// ---------------------------------------------------------------------------

export function mapPodcastRow(row: PodcastEpisodeRow): PodcastEpisode {
  // Console-entered poster wins; else the YouTube thumbnail (much clearer
  // than the committed screen-grabs), maxres with a client-side hq fallback.
  const poster =
    row.poster_image?.trim() ||
    `https://i.ytimg.com/vi/${row.youtube_id}/maxresdefault.jpg`;

  return {
    id: row.id,
    episodeNumber: row.episode_number,
    title: row.title,
    guest: row.guest,
    role: row.role,
    releaseDate: row.release_date,
    youtubeId: row.youtube_id,
    youtubeUrl: youtubeWatchUrl(row.youtube_id),
    posterImage: poster,
    duration: row.duration,
    synopsis: row.synopsis,
    takeaways: row.takeaways ?? [],
    sponsor: row.sponsor,
    isFeatured: row.is_featured,
  };
}

export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return podcastEpisodesData;
    const { data, error } = await supabase
      .from("podcast_episodes")
      .select("*")
      .eq("is_published", true)
      .order("episode_number", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapPodcastRow(row as PodcastEpisodeRow));
  }, podcastEpisodesData);
}

// ---------------------------------------------------------------------------
// TEDx talks
// ---------------------------------------------------------------------------

export function mapTedxRow(row: TedxTalkRow): TedxTalk {
  return {
    id: row.id,
    extractNumber: row.extract_number,
    speaker: row.speaker,
    topic: row.topic,
    language: row.language,
    videoUrl: row.video_url,
    posterUrl: row.poster_url,
    instagramUrl: row.instagram_url,
    duration: row.duration,
    description: row.description,
  };
}

export async function getTedxTalks(): Promise<TedxTalk[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return tedxTalksData;
    const { data, error } = await supabase
      .from("tedx_talks")
      .select("*")
      .eq("is_published", true)
      .order("extract_number", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => mapTedxRow(row as TedxTalkRow));
  }, tedxTalksData);
}

// ---------------------------------------------------------------------------
// Event pages (/events/[slug])
// ---------------------------------------------------------------------------

export async function getEventPage(
  slug: string
): Promise<{ page: EventPage; items: EventPageItem[] } | null> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("event_pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const page = data as EventPage;
    const { data: items } = await supabase
      .from("event_page_items")
      .select("*")
      .eq("event_page_id", page.id)
      .order("sort", { ascending: true });
    return { page, items: (items ?? []) as EventPageItem[] };
  }, null);
}

export async function getPublishedEventSlugs(): Promise<string[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("event_pages")
      .select("slug")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []).map((row) => (row as { slug: string }).slug);
  }, []);
}

// ---------------------------------------------------------------------------
// About sections + mandates
// ---------------------------------------------------------------------------

const FALLBACK_ABOUT_SECTIONS: AboutSection[] = [
  {
    id: "mission",
    key: "mission",
    sort_order: 1,
    title: "Une mission claire : Dépasser la technique pour embrasser l'humain",
    body: "Le Dentalk Club FMDC est né de la conviction qu'un excellent chirurgien-dentiste ne se définit pas uniquement par sa dextérité clinique, mais également par son aptitude à communiquer avec clarté, convaincre avec éthique et transmettre avec passion.\n\nDepuis 2024, le club offre un cadre bienveillant où chaque étudiant développe son aisance scénique, participe à des tournois de débat et porte de grandes initiatives académiques.",
    is_published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "poles",
    key: "poles",
    sort_order: 2,
    title: "Les 5 Pôles d'Excellence du Club",
    body: "Cinq pôles opérationnels structurent l'action du bureau exécutif : Présidence & Stratégie, Coordination & Gestion, Médias & Identité Visuelle, Logistique Événementielle et Pôles Linguistiques & Débats. Chaque pôle est piloté par ses responsables de section.",
    is_published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "partners",
    key: "partners",
    sort_order: 3,
    title: "Ils nous accompagnent dans l'aventure",
    body: "Flex Dental, sponsor officiel, accompagne nos cérémonies académiques, trophées d'éloquence et tournages podcasts. Le Club Social Dentaire (CSD), club partenaire, co-produit le Let's Talk Podcast et anime la vie étudiante à nos côtés.",
    is_published: true,
    created_at: "",
    updated_at: "",
  },
];

export async function getAboutSections(): Promise<AboutSection[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return FALLBACK_ABOUT_SECTIONS;
    const { data, error } = await supabase
      .from("about_sections")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as AboutSection[];
  }, FALLBACK_ABOUT_SECTIONS);
}

const FALLBACK_MANDATE: MandateWithMembers = {
  id: "fallback-mandate",
  year_label: "Mandat 2025–2026",
  is_current: true,
  infographic_url: "/media/team/bureau_executif_2025_2026.jpg",
  created_at: "",
  members: [
    { name: "El Guerraoui Hatim", role: "Président" },
    { name: "Saad El Khabbouli", role: "Vice-Président" },
    { name: "Maryam Saber", role: "Vice-Présidente" },
    { name: "Aya Jei", role: "Secrétaire Générale" },
    { name: "Douaae Abla", role: "Chef de Projet" },
    { name: "Elhoussein Ettallab", role: "Trésorier" },
    { name: "Anas Essaghir", role: "Directeur Artistique" },
    { name: "Yassir El Kinani", role: "Responsable Média" },
    { name: "Zyad Mrabet", role: "Responsable Logistique" },
    { name: "Salwa Jawadi", role: "Responsable ANG" },
    { name: "Ihssane Rouadha", role: "Responsable FR" },
    { name: "Hafsa Ouagague", role: "Responsable AR" },
  ].map((m, i) => ({
    id: `fallback-mm-${i}`,
    mandate_id: "fallback-mandate",
    name: m.name,
    role: m.role,
    sort: i + 1,
    photo_url: null,
    profile_id: null,
    created_at: "",
  })),
};

export async function getMandates(): Promise<MandateWithMembers[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [FALLBACK_MANDATE];
    // Single round-trip: members are fetched as an embedded collection.
    const { data: mandates, error } = await supabase
      .from("mandates")
      .select("*, mandate_members(*)")
      .order("is_current", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!mandates || mandates.length === 0) return [FALLBACK_MANDATE];
    return mandates.map((raw) => {
      const mandate = raw as MandateWithMembers & { mandate_members?: MandateWithMembers["members"] };
      return {
        ...mandate,
        members: [...(mandate.mandate_members ?? [])].sort((a, b) => a.sort - b.sort),
      };
    });
  }, [FALLBACK_MANDATE]);
}

// ---------------------------------------------------------------------------
// Committees (fallback = current 5 poles)
// ---------------------------------------------------------------------------

const FALLBACK_COMMITTEES: Committee[] = [
  { name: "Présidence & Stratégie", description: "Pilotage stratégique, représentation auprès du décanat de la FMDC et relations inter-universitaires." },
  { name: "Coordination & Gestion", description: "Suivi des budgets, calendrier des événements, conventions de sponsoring et logistique." },
  { name: "Médias & Identité Visuelle", description: "Production vidéo des podcasts Let's Talk, identité graphique, captation photo et gestion des réseaux." },
  { name: "Logistique Événementielle", description: "Régie technique des amphithéâtres, sonorisation, gestion des scènes de débats et matériel." },
  { name: "Pôles Linguistiques & Débats", description: "Animation des joutes oratoires, rédaction des motions de débats et masterclasses hebdomadaires." },
].map((c, i) => ({ ...c, id: `fallback-c-${i}`, sort: i + 1, created_at: "" }));

export async function getCommittees(): Promise<Committee[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return FALLBACK_COMMITTEES;
    const { data, error } = await supabase
      .from("committees")
      .select("*")
      .order("sort", { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? (data as Committee[]) : FALLBACK_COMMITTEES;
  }, FALLBACK_COMMITTEES);
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export async function getGalleryImages(): Promise<GalleryItem[]> {
  return withFallback(async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return galleryItemsData;
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("is_published", true)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as GalleryImageRow[];
    if (rows.length === 0) return galleryItemsData;
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      categoryLabel: row.category_label,
      imageUrl: row.image_url,
      description: row.description,
      date: row.date_label || undefined,
    }));
  }, galleryItemsData);
}

export type { CommentBoardItem };
