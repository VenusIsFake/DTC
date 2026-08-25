-- ============================================================================
-- DTC Club Platform — seed data (v1)
-- Apply AFTER schema.sql. Mirrors the static src/data content so the DB-driven
-- site renders identically to the static site on day one.
-- ============================================================================

-- Commissions (les 5 pôles actuels) ------------------------------------------
insert into public.committees (name, description, sort) values
  ('Présidence & Stratégie', 'Pilotage stratégique, représentation auprès du décanat de la FMDC et relations inter-universitaires.', 1),
  ('Coordination & Gestion', 'Suivi des budgets, calendrier des événements, conventions de sponsoring et logistique.', 2),
  ('Médias & Identité Visuelle', 'Production vidéo des podcasts Let''s Talk, identité graphique, captation photo et gestion des réseaux.', 3),
  ('Logistique Événementielle', 'Régie technique des amphithéâtres, sonorisation, gestion des scènes de débats et matériel.', 4),
  ('Pôles Linguistiques & Débats', 'Animation des joutes oratoires, rédaction des motions de débats et masterclasses hebdomadaires.', 5)
on conflict (name) do nothing;

-- Mandat 2025–2026 ------------------------------------------------------------
insert into public.mandates (year_label, is_current, infographic_url)
values ('Mandat 2025–2026', true, '/media/team/bureau_executif_2025_2026.jpg')
on conflict (year_label) do nothing;

insert into public.mandate_members (mandate_id, name, role, sort)
select m.id, v.name, v.role, v.sort
from public.mandates m
cross join (values
  ('El Guerraoui Hatim', 'Président', 1),
  ('Saad El Khabbouli', 'Vice-Président', 2),
  ('Maryam Saber', 'Vice-Présidente', 3),
  ('Aya Jei', 'Secrétaire Générale', 4),
  ('Douaae Abla', 'Chef de Projet', 5),
  ('Elhoussein Ettallab', 'Trésorier', 6),
  ('Anas Essaghir', 'Directeur Artistique', 7),
  ('Yassir El Kinani', 'Responsable Média', 8),
  ('Zyad Mrabet', 'Responsable Logistique', 9),
  ('Salwa Jawadi', 'Responsable ANG', 10),
  ('Ihssane Rouadha', 'Responsable FR', 11),
  ('Hafsa Ouagague', 'Responsable AR', 12)
) as v(name, role, sort)
where m.year_label = 'Mandat 2025–2026'
on conflict (mandate_id, name) do nothing;

-- Podcast Let's Talk (4 épisodes) ----------------------------------------------
insert into public.podcast_episodes
  (episode_number, title, guest, role, release_date, youtube_id, duration, synopsis, takeaways, sponsor, poster_image, is_featured, is_published)
values
  (4, 'Chirurgie, Pédagogie & Vision Médicale', 'Professeur Sidi Mohamed Bouzoubaa',
   'Professeur Universitaire en Chirurgie Orale & Enseignant-Chercheur (FMDC / CHU Ibn Rochd)',
   'Avril 2026', 'FXTjMfmNmss', '48:15',
   'Un échange d''une profondeur rare croisant chirurgie orale, rigueur clinique, transmission pédagogique et conseils précieux pour les générations futures de chirurgiens-dentistes.',
   array[
     'L''importance de la rigueur clinique dès les premières années de stage hospitalier',
     'L''alliance de l''éthique médicale et de l''écoute bienveillante du patient',
     'Les évolutions futures de la chirurgie orale et des technologies prothétiques',
     'La persévérance comme pilier de la réussite académique et professionnelle'
   ], 'Flex Dental', '/media/podcasts/podcast_ep4_prof_bouzoubaa.jpg', true, true),
  (3, 'Parcours Académique & Odontologie', 'Professeure Sofia Haitami',
   'Enseignante-Chercheuse & Spécialiste à la Faculté de Médecine Dentaire de Casablanca',
   'Novembre 2025', 'JoMwnQbmKm0', '42:30',
   'Discussion passionnante sur les méthodes d''apprentissage en odontologie, la gestion des premiers cas complexes et les opportunités de recherche au Maroc.',
   array[
     'Comment structurer sa préparation aux examens cliniques',
     'L''importance de la curiosité scientifique et de la veille médicale',
     'Développer une communication claire avec les patients anxieux'
   ], 'Flex Dental', '/media/podcasts/podcast_ep3_prof_haitam.jpg', false, true),
  (2, 'Excellence Pratique & Spécialisation', 'Professeur Amine Chafii',
   'Professeur & Praticien Spécialiste en Médecine Dentaire',
   'Septembre 2025', 'C1dKfXuC0us', '39:45',
   'Un retour d''expérience enrichissant sur la transition de l''université vers la pratique clinique avancée, la gestion d''équipe et la formation continue.',
   array[
     'Les clés pour réussir sa spécialisation et son insertion professionnelle',
     'La gestion de la relation de confiance et de l''empathie soignant',
     'L''impact des nouvelles technologies dans le diagnostic dentaire'
   ], 'Flex Dental', '/media/podcasts/studio_bts_viewfinder.jpg', false, true),
  (1, 'Épisode Inaugural : Enseignement & Endodontie', 'Professeur Said Dhaimy',
   'Professeur Universitaire en Odontologie Conservatrice & Endodontie (FMDC Casablanca)',
   'Juin 2025', 'njrC04ZxJo0', '45:10',
   'Le tout premier épisode historique du Let''s Talk Podcast avec Pr. Said Dhaimy, animé par Hatim Elguerraoui & Ayman El Attar.',
   array[
     'La genèse et les objectifs du projet ''Let''''s Talk''',
     'Conseils fondamentaux pour débuter en endodontie clinique',
     'Créer un espace d''inspiration et d''échange libre entre professeurs et étudiants'
   ], 'Flex Dental', '/media/podcasts/podcast_ep1_launch.jpg', false, true)
on conflict (episode_number) do nothing;

-- TEDxFMDC — les 8 talks -------------------------------------------------------
insert into public.tedx_talks
  (extract_number, speaker, topic, language, video_url, poster_url, instagram_url, duration, description, is_published)
values
  (1, 'Yahia Chemsi', 'Les réseaux sociaux, l''intelligence artificielle et l''humain', 'FR',
   '/media/events/tedx_01_yahia_chemsi.mp4', '/media/events/tedx_01_yahia_chemsi.jpg',
   'https://www.instagram.com/p/DRsU8yIgBIp/', '1:42',
   'Une exploration percutante des dynamiques entre les algorithmes modernes, l''intelligence artificielle et la préservation de la conscience humaine.', true),
  (2, 'Aya Jei', 'Brain rot : comprendre et surmonter l''hyper-stimulation', 'FR',
   '/media/events/tedx_02_aya_jei.mp4', '/media/events/tedx_02_aya_jei.jpg',
   'https://www.instagram.com/p/DRusITjjZg2/', '1:28',
   'Décryptage du phénomène de surcharge cognitive contemporaine (''brain rot'') et plaidoyer pour une écologie attentionnelle saine.', true),
  (3, 'Inès Ben Salah', 'L''intelligence émotionnelle dans la pratique médicale', 'FR',
   '/media/events/tedx_03_ines_ben_salah.mp4', '/media/events/tedx_03_ines_ben_salah.jpg',
   'https://www.instagram.com/p/DRvCNV4AA-V/', '1:15',
   'Comment la maîtrise de l''empathie et la régulation émotionnelle transforment la relation soignant-patient en milieu clinique.', true),
  (4, 'Aya Talbi', 'Zlayjiphobie : plaidoyer pour un patriotisme conscient', 'FR',
   '/media/events/tedx_04_aya_talbi.mp4', '/media/events/tedx_04_aya_talbi.jpg',
   'https://www.instagram.com/p/DRxngHcgGSG/', '1:08',
   'Une réflexion audacieuse sur l''héritage culturel marocain, le dépassement des complexes et la fierté patriotique éclairée.', true),
  (5, 'Baha Eddine Achaach', 'Gen Z : the pulse of a changing Morocco', 'EN',
   '/media/events/tedx_05_baha_eddine_achaach.mp4', '/media/events/tedx_05_baha_eddine_achaach.jpg',
   'https://www.instagram.com/p/DR2qD2mAMT8/', '1:20',
   'An inspiring look at how the youth is driving social innovation, entrepreneurship, and creative disruption across Morocco.', true),
  (6, 'Hiba Birouki', 'The cost of being flawless : déconstruire le perfectionnisme', 'EN',
   '/media/events/tedx_06_hiba_birouki.mp4', '/media/events/tedx_06_hiba_birouki.jpg',
   'https://www.instagram.com/p/DR5h9jODPEm/', '1:12',
   'Unraveling the toxic pressures of perfectionism and embracing vulnerability as the real foundation for authentic growth.', true),
  (7, 'George Pupwe', 'Redefining efficiency, beyond the perfect image', 'EN',
   '/media/events/tedx_07_george_pupwe.mp4', '/media/events/tedx_07_george_pupwe.jpg',
   'https://www.instagram.com/p/DSAuStRjSR8/', '0:58',
   'Moving beyond surface productivity metrics to cultivate deep, purpose-driven impact in academic and personal life.', true),
  (8, 'Fahd Rahim', 'Purpose over pressure : trouver sa vocation authentique', 'EN',
   '/media/events/tedx_08_fahd_rahim.mp4', '/media/events/tedx_08_fahd_rahim.jpg',
   'https://www.instagram.com/p/DSBI9mogErJ/', '0:45',
   'A powerful closing talk on choosing intrinsic purpose and passions over external expectations and social pressure.', true)
on conflict (extract_number) do nothing;

-- Sections « À propos » entièrement éditables ----------------------------------
insert into public.about_sections (key, sort_order, title, body, is_published) values
  ('mission', 1,
   'Une mission claire : Dépasser la technique pour embrasser l''humain',
   E'Le Dentalk Club FMDC est né de la conviction qu''un excellent chirurgien-dentiste ne se définit pas uniquement par sa dextérité clinique, mais également par son aptitude à communiquer avec clarté, convaincre avec éthique et transmettre avec passion.\n\nDepuis 2024, le club offre un cadre bienveillant où chaque étudiant développe son aisance scénique, participe à des tournois de débat et porte de grandes initiatives académiques.',
   true),
  ('poles', 2,
   'Les 5 Pôles d''Excellence du Club',
   E'Cinq pôles opérationnels structurent l''action du bureau exécutif : Présidence & Stratégie, Coordination & Gestion, Médias & Identité Visuelle, Logistique Événementielle et Pôles Linguistiques & Débats. Chaque pôle est piloté par ses responsables de section.',
   true),
  ('partners', 3,
   'Ils nous accompagnent dans l''aventure',
   E'Flex Dental, sponsor officiel, accompagne nos cérémonies académiques, trophées d''éloquence et tournages podcasts. Le Club Social Dentaire (CSD), club partenaire, co-produit le Let''s Talk Podcast et anime la vie étudiante à nos côtés.',
   true)
on conflict (key) do nothing;
