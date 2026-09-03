// Shared domain types for the club platform. Row shapes mirror
// supabase/schema.sql (snake_case columns are kept as-is to match DB rows;
// camelCase aliases are produced by the mappers in src/lib/data.ts for the
// legacy static components).

export type Role = "guest" | "member" | "bureau" | "admin";

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

export interface PartnerCard {
  name: string;
  tagline: string;
}

export interface SiteSettings {
  events_visible: boolean;
  promo_years: number[];
  marquee_line?: string;
  hero_tagline?: string;
  highlight_kicker?: string;
  highlight_date?: string;
  about_intro?: string;
  sponsor?: PartnerCard;
  partner_club?: PartnerCard;
  /** Console-picked gallery image per homepage activity card (undefined = default). */
  activity_card_images?: {
    debates?: string;
    workshops?: string;
    team?: string;
  };
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
  photo_url: string | null;
  profile_id: string | null;
  created_at: string;
}

/** Minimal profile shape for the console member picker (bureau_list_profiles RPC). */
export interface ProfileOption {
  id: string;
  full_name: string;
  avatar_url: string | null;
  promo: number | null;
  committee: string;
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

// ---------------------------------------------------------------------------
// Bureau recruitment campaigns (/candidature + console "Candidatures" tab)
// ---------------------------------------------------------------------------

export type StudyYear = "1A" | "2A" | "3A" | "4A" | "5A" | "6A";
export const STUDY_YEARS: StudyYear[] = ["1A", "2A", "3A", "4A", "5A", "6A"];

export interface Recruitment {
  id: string;
  title: string;
  intro: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecruitmentPosition {
  id: string;
  recruitment_id: string;
  title: string;
  description: string;
  sort: number;
  created_at: string;
}

export type ApplicationStatus = "new" | "reviewed" | "accepted" | "rejected";

export interface ApplicationRow {
  id: string;
  recruitment_id: string;
  position_id: string | null;
  full_name: string;
  study_year: StudyYear;
  phone: string;
  had_responsibility: boolean;
  motivation: string;
  why_you: string;
  profile_id: string | null;
  status: ApplicationStatus;
  created_at: string;
  /** Joined via embedded `recruitment_positions` in the console query. */
  position?: { title: string } | null;
}
