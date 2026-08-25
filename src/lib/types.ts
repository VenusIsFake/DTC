// Shared domain types for the club platform. Row shapes mirror
// supabase/schema.sql (snake_case columns are kept as-is to match DB rows;
// camelCase aliases are produced by the mappers in src/lib/data.ts for the
// legacy static components).

export type Role = "member" | "bureau" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_banned: boolean;
  promo: number | null;
  committee_id: string | null;
  avatar_url: string | null;
  bio: string;
  phone: string;
  created_at: string;
}

export interface Committee {
  id: string;
  name: string;
  description: string;
  sort: number;
  created_at: string;
}

export type AnnouncementKind = "atelier" | "annonce";
export type ContentStatus = "draft" | "published" | "archived";

export interface Announcement {
  id: string;
  kind: AnnouncementKind;
  title: string;
  body: string;
  poster_url: string;
  event_date: string | null;
  location: string;
  is_pinned: boolean;
  status: ContentStatus;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementBoardItem extends Announcement {
  author_name: string | null;
  rsvp_count: number;
}

export type IdeaStatus = "open" | "planned" | "done" | "rejected";

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdeaBoardItem extends Idea {
  author_name: string | null;
  author_avatar: string | null;
  vote_count: number;
  comment_count: number;
}

export interface CommentBoardItem {
  id: string;
  idea_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

export interface PodcastEpisodeRow {
  id: string;
  episode_number: number;
  title: string;
  guest: string;
  role: string;
  release_date: string;
  youtube_id: string;
  duration: string;
  synopsis: string;
  takeaways: string[];
  sponsor: string;
  poster_image: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TedxTalkRow {
  id: string;
  extract_number: number;
  speaker: string;
  topic: string;
  language: "FR" | "EN" | "AR";
  video_url: string;
  poster_url: string;
  instagram_url: string;
  duration: string;
  description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventPage {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  hero_poster: string;
  description: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface EventPageItem {
  id: string;
  event_page_id: string;
  title: string;
  speaker: string;
  description: string;
  video_url: string;
  poster_url: string;
  sort: number;
  created_at: string;
}

export interface HomeStat {
  value: string;
  label: string;
}

export interface SiteSettings {
  events_visible: boolean;
  promo_years: number[];
  home_stats?: HomeStat[];
}

export interface Mandate {
  id: string;
  year_label: string;
  is_current: boolean;
  infographic_url: string;
  created_at: string;
}

export interface MandateMember {
  id: string;
  mandate_id: string;
  name: string;
  role: string;
  sort: number;
  created_at: string;
}

export interface MandateWithMembers extends Mandate {
  members: MandateMember[];
}

export interface AboutSection {
  id: string;
  key: string;
  sort_order: number;
  title: string;
  body: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectoryEntry {
  id: string;
  full_name: string;
  avatar_url: string | null;
  promo: number | null;
  committee: string;
}

export interface GalleryImageRow {
  id: string;
  title: string;
  category: "tedx" | "podcast" | "debates" | "team" | "awards";
  category_label: string;
  image_url: string;
  description: string;
  date_label: string;
  sort: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string | null;
  promo: number | null;
  committee: string;
  role: Role;
  is_banned: boolean;
  created_at: string;
}
