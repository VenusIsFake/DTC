export interface TedxTalk {
  id: string;
  extractNumber: number;
  speaker: string;
  topic: string;
  language: "FR" | "EN" | "AR";
  videoUrl: string;
  posterUrl: string;
  instagramUrl: string;
  duration: string;
  description: string;
}

export const tedxTalksData: TedxTalk[] = [
  {
    id: "tedx-01",
    extractNumber: 1,
    speaker: "Yahia Chemsi",
    topic: "Les réseaux sociaux, l'intelligence artificielle et l'humain",
    language: "FR",
    videoUrl: "/media/events/tedx_01_yahia_chemsi.mp4",
    posterUrl: "/media/events/tedx_01_yahia_chemsi.jpg",
    instagramUrl: "https://www.instagram.com/p/DRsU8yIgBIp/",
    duration: "1:42",
    description: "Une exploration percutante des dynamiques entre les algorithmes modernes, l'intelligence artificielle et la préservation de la conscience humaine.",
  },
  {
    id: "tedx-02",
    extractNumber: 2,
    speaker: "Aya Jei",
    topic: "Brain rot : comprendre et surmonter l'hyper-stimulation",
    language: "FR",
    videoUrl: "/media/events/tedx_02_aya_jei.mp4",
    posterUrl: "/media/events/tedx_02_aya_jei.jpg",
    instagramUrl: "https://www.instagram.com/p/DRusITjjZg2/",
    duration: "1:28",
    description: "Décryptage du phénomène de surcharge cognitive contemporaine ('brain rot') et plaidoyer pour une écologie attentionnelle saine.",
  },
  {
    id: "tedx-03",
    extractNumber: 3,
    speaker: "Inès Ben Salah",
    topic: "L'intelligence émotionnelle dans la pratique médicale",
    language: "FR",
    videoUrl: "/media/events/tedx_03_ines_ben_salah.mp4",
    posterUrl: "/media/events/tedx_03_ines_ben_salah.jpg",
    instagramUrl: "https://www.instagram.com/p/DRvCNV4AA-V/",
    duration: "1:15",
    description: "Comment la maîtrise de l'empathie et la régulation émotionnelle transforment la relation soignant-patient en milieu clinique.",
  },
  {
    id: "tedx-04",
    extractNumber: 4,
    speaker: "Aya Talbi",
    topic: "Zlayjiphobie : plaidoyer pour un patriotisme conscient",
    language: "FR",
    videoUrl: "/media/events/tedx_04_aya_talbi.mp4",
    posterUrl: "/media/events/tedx_04_aya_talbi.jpg",
    instagramUrl: "https://www.instagram.com/p/DRxngHcgGSG/",
    duration: "1:08",
    description: "Une réflexion audacieuse sur l'héritage culturel marocain, le dépassement des complexes et la fierté patriotique éclairée.",
  },
  {
    id: "tedx-05",
    extractNumber: 5,
    speaker: "Baha Eddine Achaach",
    topic: "Gen Z : the pulse of a changing Morocco",
    language: "EN",
    videoUrl: "/media/events/tedx_05_baha_eddine_achaach.mp4",
    posterUrl: "/media/events/tedx_05_baha_eddine_achaach.jpg",
    instagramUrl: "https://www.instagram.com/p/DR2qD2mAMT8/",
    duration: "1:20",
    description: "An inspiring look at how the youth is driving social innovation, entrepreneurship, and creative disruption across Morocco.",
  },
  {
    id: "tedx-06",
    extractNumber: 6,
    speaker: "Hiba Birouki",
    topic: "The cost of being flawless : déconstruire le perfectionnisme",
    language: "EN",
    videoUrl: "/media/events/tedx_06_hiba_birouki.mp4",
    posterUrl: "/media/events/tedx_06_hiba_birouki.jpg",
    instagramUrl: "https://www.instagram.com/p/DR5h9jODPEm/",
    duration: "1:12",
    description: "Unraveling the toxic pressures of perfectionism and embracing vulnerability as the real foundation for authentic growth.",
  },
  {
    id: "tedx-07",
    extractNumber: 7,
    speaker: "George Pupwe",
    topic: "Redefining efficiency, beyond the perfect image",
    language: "EN",
    videoUrl: "/media/events/tedx_07_george_pupwe.mp4",
    posterUrl: "/media/events/tedx_07_george_pupwe.jpg",
    instagramUrl: "https://www.instagram.com/p/DSAuStRjSR8/",
    duration: "0:58",
    description: "Moving beyond surface productivity metrics to cultivate deep, purpose-driven impact in academic and personal life.",
  },
  {
    id: "tedx-08",
    extractNumber: 8,
    speaker: "Fahd Rahim",
    topic: "Purpose over pressure : trouver sa vocation authentique",
    language: "EN",
    videoUrl: "/media/events/tedx_08_fahd_rahim.mp4",
    posterUrl: "/media/events/tedx_08_fahd_rahim.jpg",
    instagramUrl: "https://www.instagram.com/p/DSBI9mogErJ/",
    duration: "0:45",
    description: "A powerful closing talk on choosing intrinsic purpose and passions over external expectations and social pressure.",
  },
];
