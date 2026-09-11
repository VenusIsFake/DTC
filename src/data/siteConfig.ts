export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Dentalk Club FMDC",
  acronym: "DTC",
  tagline: "Que ta voix résonne en échos sans fin.",
  description: "Club d'éloquence, débats et événements académiques de la Faculté de Médecine Dentaire de Casablanca (FMDC - UH2C).",
  siteUrl: "https://dentalkclubfmdc.com",
  /** Backstage host — middleware rewrites it to /secret with the site chrome stripped. */
  secretHost: "vx72kq9.dentalkclubfmdc.com",
  /**
   * Cache-bust version for brand assets (logo + every icon). Bump ONCE here
   * after replacing an asset — all cacheable URLs derive from it via
   * assetUrl(), so one commit re-points every browser and the service worker.
   */
  assetVersion: "2026d",
  /** Social share card (only place the text-lockup logo appears). */
  ogImage: "/og-image-2026.jpg",
  /** Cache-busted URL for a public/ asset, e.g. assetUrl("/logo.png"). */
  assetUrl(path: string) {
    return `${path}?v=${this.assetVersion}`;
  },
  foundingDate: "Novembre 2024",
  university: "Université Hassan II de Casablanca",
  faculty: "Faculté de Médecine Dentaire de Casablanca",
  instagramUrl: "https://www.instagram.com/dentalkclub_fmdc/",
  instagramHandle: "@dentalkclub_fmdc",
  youtubeChannelUrl: "https://www.youtube.com/@LetsTalkPodcast-00",
  sponsor: {
    name: "Flex Dental",
    tagline: "Partenaire Officiel & Sponsor des Événements DTC",
  },
  partnerClub: {
    name: "Club Social Dentaire (CSD)",
    tagline: "Partenaire Co-Producteur du Let's Talk Podcast",
  },
  navItems: [
    { label: "Accueil", href: "/" },
    { label: "TEDx & Débats", href: "/events" },
    { label: "Let's Talk Podcast", href: "/podcast" },
    { label: "Galerie Média", href: "/gallery" },
    { label: "À Propos", href: "/about" },
  ] as NavItem[],

  /**
   * Club-platform navigation (server components call this with the live
   * `events_visible` setting so a hidden section disappears from the nav
   * entirely instead of being CSS-hidden).
   */
  getNavItems(eventsVisible: boolean): NavItem[] {
    const items: NavItem[] = [
      { label: "Accueil", href: "/" },
      { label: "Annonces & Idées", href: "/annonces" },
    ];
    if (eventsVisible) {
      items.push({ label: "TEDx & Débats", href: "/events" });
    }
    items.push(
      { label: "Let's Talk Podcast", href: "/podcast" },
      { label: "Galerie Média", href: "/gallery" },
      { label: "À Propos", href: "/about" }
    );
    return items;
  },
  stats: [
    { value: "1,500+", label: "Étudiants & Communauté" },
    { value: "97+", label: "Activités & Publications" },
    { value: "8", label: "Talks Vidéo TEDxFMDC" },
    { value: "4+", label: "Épisodes Podcast" },
  ],
};
