export interface GalleryItem {
  id: string;
  title: string;
  category: "tedx" | "podcast" | "debates" | "team" | "awards";
  categoryLabel: string;
  imageUrl: string;
  description: string;
  date?: string;
}

export const galleryItemsData: GalleryItem[] = [
  // TEDx
  {
    id: "gal-tedx-stage",
    title: "Amphithéâtre TEDxFMDC",
    category: "tedx",
    categoryLabel: "TEDxFMDC",
    imageUrl: "/media/events/tedx_fmdc_auditorium.jpg",
    description: "Photo de groupe emblématique avec les lettres 3D 'TEDx' sur la scène de l'amphithéâtre.",
    date: "Novembre 2025",
  },
  {
    id: "gal-tedx-yahia",
    title: "Talk TEDx: Yahia Chemsi",
    category: "tedx",
    categoryLabel: "TEDxFMDC",
    imageUrl: "/media/events/tedx_01_yahia_chemsi.jpg",
    description: "Extrait 1/8: Les réseaux sociaux, l'intelligence artificielle et l'humain.",
    date: "Novembre 2025",
  },
  {
    id: "gal-tedx-aya",
    title: "Talk TEDx: Aya Jei",
    category: "tedx",
    categoryLabel: "TEDxFMDC",
    imageUrl: "/media/events/tedx_02_aya_jei.jpg",
    description: "Extrait 2/8: Brain rot et déconnexion attentionnelle.",
    date: "Novembre 2025",
  },
  {
    id: "gal-tedx-ines",
    title: "Talk TEDx: Inès Ben Salah",
    category: "tedx",
    categoryLabel: "TEDxFMDC",
    imageUrl: "/media/events/tedx_03_ines_ben_salah.jpg",
    description: "Extrait 3/8: L'intelligence émotionnelle en pratique médicale.",
    date: "Novembre 2025",
  },
  {
    id: "gal-tedx-fahd",
    title: "Talk TEDx: Fahd Rahim",
    category: "tedx",
    categoryLabel: "TEDxFMDC",
    imageUrl: "/media/events/tedx_08_fahd_rahim.jpg",
    description: "Extrait 8/8: Purpose over pressure.",
    date: "Novembre 2025",
  },

  // Podcasts
  {
    id: "gal-pod-bouzoubaa",
    title: "Affiche Officielle: Pr. Sidi Mohamed Bouzoubaa",
    category: "podcast",
    categoryLabel: "Let's Talk Podcast",
    imageUrl: "/media/podcasts/podcast_ep4_prof_bouzoubaa.jpg",
    description: "Affiche de sortie YouTube pour le 4ème épisode du podcast.",
    date: "Avril 2026",
  },
  {
    id: "gal-pod-bts",
    title: "Coulisses Studio d'Enregistrement",
    category: "podcast",
    categoryLabel: "Let's Talk Podcast",
    imageUrl: "/media/podcasts/studio_bts_viewfinder.jpg",
    description: "Moniteur caméra DSLR cadrant les micros et les animateurs en plein enregistrement.",
    date: "Avril 2026",
  },
  {
    id: "gal-pod-haitam",
    title: "Épisode 3 : Pr. Sofia Haitami",
    category: "podcast",
    categoryLabel: "Let's Talk Podcast",
    imageUrl: "/media/podcasts/podcast_ep3_prof_haitam.jpg",
    description: "Affiche officielle de l'épisode 3 consacré à l'odontologie académique.",
    date: "Novembre 2025",
  },

  // Debates & Workshops
  {
    id: "gal-deb-table",
    title: "Session Débats en Table Dentalk",
    category: "debates",
    categoryLabel: "Débats & Formations",
    imageUrl: "/media/events/debate_table_session.jpg",
    description: "Match parlementaire en face-à-face entre membres du club.",
    date: "Octobre 2025",
  },
  {
    id: "gal-deb-roundtable",
    title: "Table Ronde & Échanges Rhétoriques",
    category: "debates",
    categoryLabel: "Débats & Formations",
    imageUrl: "/media/events/debate_roundtable.jpg",
    description: "Cercle d'argumentation et débat interactif avec le public étudiant.",
    date: "Février 2025",
  },
  {
    id: "gal-eloquence-stage",
    title: "Discours d'Éloquence en Amphithéâtre",
    category: "debates",
    categoryLabel: "Débats & Formations",
    imageUrl: "/media/events/eloquence_keynote_stage.jpg",
    description: "Prise de parole captivante depuis le pupitre principal.",
    date: "2025",
  },
  {
    id: "gal-eloquence-work",
    title: "Atelier Pratique de Prise de Parole",
    category: "debates",
    categoryLabel: "Débats & Formations",
    imageUrl: "/media/events/eloquence_workshop.jpg",
    description: "Exercices de posture, modulation vocale et gestion du trac en Salle Vésale.",
    date: "Octobre 2025",
  },

  // Team & Life
  {
    id: "gal-team-hierarchy",
    title: "Bureau Exécutif (Mandat 2025-2026)",
    category: "team",
    categoryLabel: "Vie du Club",
    imageUrl: "/media/team/bureau_executif_2025_2026.jpg",
    description: "Organigramme officiel et présentation des membres du bureau.",
    date: "Juin 2025",
  },
  {
    id: "gal-team-advisor",
    title: "Hommage Floral au Professeur Conseiller",
    category: "team",
    categoryLabel: "Vie du Club",
    imageUrl: "/media/team/advisor_flower_tribute.jpg",
    description: "Remise d'un bouquet par le bureau exécutif en signe de gratitude.",
    date: "2025",
  },
  {
    id: "gal-team-retreat",
    title: "Sortie & Cohésion en Plein Air",
    category: "team",
    categoryLabel: "Vie du Club",
    imageUrl: "/media/team/outdoor_retreat.jpg",
    description: "Journée de partage, détente et cohésion d'équipe dans la forêt de Bouskoura.",
    date: "Février 2025",
  },
  {
    id: "gal-team-meeting",
    title: "Réunion Stratégique du Bureau",
    category: "team",
    categoryLabel: "Vie du Club",
    imageUrl: "/media/team/leadership_meeting.jpg",
    description: "Planification des grands projets et calendrier annuel du club.",
    date: "2025",
  },

  // Awards
  {
    id: "gal-award-ceremony",
    title: "Remise de Trophée Officiel",
    category: "awards",
    categoryLabel: "Trophées & Cérémonies",
    imageUrl: "/media/awards/trophy_hatim_elguerraoui.jpg",
    description: "Trophée d'excellence remis par le jury professoral (Sponsorisé par Flex Dental).",
    date: "Mars 2026",
  },
  {
    id: "gal-award-finale",
    title: "Grande Finale & Clôture Officielle",
    category: "awards",
    categoryLabel: "Trophées & Cérémonies",
    imageUrl: "/media/awards/grand_finale_group.jpg",
    description: "Photo de clôture réunissant professeurs, jury et orateurs sur scène.",
    date: "Mars 2026",
  },
];
