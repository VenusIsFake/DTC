export interface PodcastEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  guest: string;
  role: string;
  releaseDate: string;
  youtubeId: string;
  youtubeUrl: string;
  posterImage: string;
  duration: string;
  synopsis: string;
  takeaways: string[];
  sponsor: string;
  isFeatured?: boolean;
}

export const podcastEpisodesData: PodcastEpisode[] = [
  {
    id: "ep-4",
    episodeNumber: 4,
    title: "Chirurgie, Pédagogie & Vision Médicale",
    guest: "Professeur Sidi Mohamed Bouzoubaa",
    role: "Professeur Universitaire en Chirurgie Orale & Enseignant-Chercheur (FMDC / CHU Ibn Rochd)",
    releaseDate: "Avril 2026",
    youtubeId: "FXTjMfmNmss",
    youtubeUrl: "https://www.youtube.com/watch?v=FXTjMfmNmss",
    posterImage: "https://img.youtube.com/vi/FXTjMfmNmss/maxresdefault.jpg",
    duration: "48:15",
    synopsis: "Un échange d'une profondeur rare croisant chirurgie orale, rigueur clinique, transmission pédagogique et conseils précieux pour les générations futures de chirurgiens-dentistes.",
    takeaways: [
      "L'importance de la rigueur clinique dès les premières années de stage hospitalier",
      "L'alliance de l'éthique médicale et de l'écoute bienveillante du patient",
      "Les évolutions futures de la chirurgie orale et des technologies prothétiques",
      "La persévérance comme pilier de la réussite académique et professionnelle",
    ],
    sponsor: "Flex Dental",
    isFeatured: true,
  },
  {
    id: "ep-3",
    episodeNumber: 3,
    title: "Parcours Académique & Odontologie",
    guest: "Professeure Sofia Haitami",
    role: "Enseignante-Chercheuse & Spécialiste à la Faculté de Médecine Dentaire de Casablanca",
    releaseDate: "Novembre 2025",
    youtubeId: "JoMwnQbmKm0",
    youtubeUrl: "https://www.youtube.com/watch?v=JoMwnQbmKm0",
    posterImage: "https://img.youtube.com/vi/JoMwnQbmKm0/maxresdefault.jpg",
    duration: "42:30",
    synopsis: "Discussion passionnante sur les méthodes d'apprentissage en odontologie, la gestion des premiers cas complexes et les opportunités de recherche au Maroc.",
    takeaways: [
      "Comment structurer sa préparation aux examens cliniques",
      "L'importance de la curiosité scientifique et de la veille médicale",
      "Développer une communication claire avec les patients anxieux",
    ],
    sponsor: "Flex Dental",
    isFeatured: false,
  },
  {
    id: "ep-2",
    episodeNumber: 2,
    title: "Excellence Pratique & Spécialisation",
    guest: "Professeur Amine Chafii",
    role: "Professeur & Praticien Spécialiste en Médecine Dentaire",
    releaseDate: "Septembre 2025",
    youtubeId: "C1dKfXuC0us",
    youtubeUrl: "https://www.youtube.com/watch?v=C1dKfXuC0us",
    posterImage: "https://img.youtube.com/vi/C1dKfXuC0us/maxresdefault.jpg",
    duration: "39:45",
    synopsis: "Un retour d'expérience enrichissant sur la transition de l'université vers la pratique clinique avancée, la gestion d'équipe et la formation continue.",
    takeaways: [
      "Les clés pour réussir sa spécialisation et son insertion professionnelle",
      "La gestion de la relation de confiance et de l'empathie soignant",
      "L'impact des nouvelles technologies dans le diagnostic dentaire",
    ],
    sponsor: "Flex Dental",
    isFeatured: false,
  },
  {
    id: "ep-1",
    episodeNumber: 1,
    title: "Épisode Inaugural : Enseignement & Endodontie",
    guest: "Professeur Said Dhaimy",
    role: "Professeur Universitaire en Odontologie Conservatrice & Endodontie (FMDC Casablanca)",
    releaseDate: "Juin 2025",
    youtubeId: "njrC04ZxJo0",
    youtubeUrl: "https://www.youtube.com/watch?v=njrC04ZxJo0",
    posterImage: "https://img.youtube.com/vi/njrC04ZxJo0/maxresdefault.jpg",
    duration: "45:10",
    synopsis: "Le tout premier épisode historique du Let's Talk Podcast avec Pr. Said Dhaimy, animé par Hatim Elguerraoui & Ayman El Attar.",
    takeaways: [
      "La genèse et les objectifs du projet 'Let's Talk'",
      "Conseils fondamentaux pour débuter en endodontie clinique",
      "Créer un espace d'inspiration et d'échange libre entre professeurs et étudiants",
    ],
    sponsor: "Flex Dental",
    isFeatured: false,
  },
];
