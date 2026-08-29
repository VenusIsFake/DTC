export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Dentalk Club FMDC",
  acronym: "DTC",
  tagline: "Let your voice be heard with endless echoes.",
  description: "Club d'éloquence, débats et événements académiques de la Faculté de Médecine Dentaire de Casablanca (FMDC - UH2C).",
  siteUrl: "https://dentalkclub-fmdc.vercel.app",
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
