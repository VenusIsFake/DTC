import React from "react";
import Image from "next/image";
import InfographicViewer from "@/components/InfographicViewer";
import { siteConfig } from "@/data/siteConfig";
import { Sparkles, Award, BookOpen, ShieldCheck, Heart, MapPin, Calendar } from "lucide-react";

export const metadata = {
  title: "À Propos",
  description: "Découvrez l'histoire, la gouvernance et la mission de Dentalk Club FMDC.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const poles = [
    {
      title: "Présidence & Stratégie",
      lead: "El Guerraoui Hatim (Président), Saad El Khabbouli & Maryam Saber (VPs)",
      desc: "Pilotage stratégique, représentation auprès du décanat de la FMDC et relations inter-universitaires.",
    },
    {
      title: "Coordination & Gestion",
      lead: "Aya Jei (Secrétaire Générale), Douaae Abla (Chef de Projet), Elhoussein Ettallab (Trésorier)",
      desc: "Suivi des budgets, calendrier des événements, conventions de sponsoring et logistique.",
    },
    {
      title: "Médias & Identité Visuelle",
      lead: "Anas Essaghir (Dir. Artistique) & Yassir El Kinani (Respo Média)",
      desc: "Production vidéo des podcasts Let's Talk, identité graphique, captation photo et gestion des réseaux.",
    },
    {
      title: "Logistique Événementielle",
      lead: "Zyad Mrabet (Respo Logistique)",
      desc: "Régie technique des amphithéâtres, sonorisation, gestion des scènes de débats et matériel.",
    },
    {
      title: "Pôles Linguistiques & Débats",
      lead: "Salwa Jawadi (ANG), Ihssane Rouadha (FR), Hafsa Ouagague (AR)",
      desc: "Animation des joutes oratoires, rédaction des motions de débats et masterclasses hebdomadaires.",
    },
  ];

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-20">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Histoire, Vision & Gouvernance</span>
        </div>
        <h1 className="text-2xl sm:text-5xl font-heading font-extrabold text-white">
          À Propos de <span className="gold-gradient-text">Dentalk Club</span>
        </h1>
        <p className="text-xs sm:text-base text-[#94A3B8] leading-relaxed">
          Fondé en novembre 2024 à la Faculté de Médecine Dentaire de Casablanca pour forger les futurs leaders de l&apos;art dentaire.
        </p>
      </div>

      {/* 1. History & Mission Section */}
      <section className="glass-card p-4 sm:p-12 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 items-center">
          <div className="lg:col-span-7 space-y-3 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-xl sm:text-3xl font-heading font-bold text-white leading-tight">
                Une mission claire : Dépasser la technique pour embrasser l&apos;humain
              </h2>
              <p className="text-xs sm:text-base text-[#CBD5E1] leading-relaxed">
                Le Dentalk Club FMDC est né de la conviction qu&apos;un excellent chirurgien-dentiste ne se définit pas uniquement par sa dextérité clinique, mais également par son aptitude à communiquer avec clarté, convaincre avec éthique et transmettre avec passion.
              </p>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Depuis 2024, le club offre un cadre bienveillant où chaque étudiant développe son aisance scénique, participe à des tournois de débat et porte de grandes initiatives académiques.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-0.5 sm:space-y-1">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[10px] sm:text-xs text-[#94A3B8] block">Fondation</span>
                <span className="text-xs sm:text-sm font-bold text-white">Nov 2024</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-0.5 sm:space-y-1">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[10px] sm:text-xs text-[#94A3B8] block">Institution</span>
                <span className="text-xs sm:text-sm font-bold text-white">FMDC Casa</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-36 h-36 sm:w-72 sm:h-72 rounded-full p-1.5 bg-gradient-to-tr from-[#1B2E4B] via-[#D4AF37]/30 to-[#385A75] shadow-2xl">
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 sm:border-4 border-[#D4AF37] shadow-inner">
                <Image
                  src="/logo.png"
                  alt="DTC Logo"
                  fill
                  sizes="(max-width: 640px) 144px, 288px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Official Executive Bureau Infographic Visual */}
      <InfographicViewer />

      {/* 3. The 5 Functional Poles Breakdown */}
      <section className="space-y-4 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Organisation Opérationnelle</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-heading font-bold text-white">
            Les 5 Pôles d&apos;Excellence du Club
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {poles.map((pole, idx) => (
            <div
              key={idx}
              className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#385A75]/30 space-y-2 sm:space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-[#1B2E4B] text-[#D4AF37]">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-white">
                  {pole.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#D4AF37] font-semibold">
                  {pole.lead}
                </p>
                <p className="text-[11px] sm:text-xs text-[#94A3B8] leading-relaxed">
                  {pole.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Partners & Faculty Recognition */}
      <section className="glass-card p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 space-y-4 sm:space-y-8 text-center">
        <div className="max-w-xl mx-auto space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
            <Award className="w-3.5 h-3.5" />
            <span>Partenaires & Soutiens</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Ils nous accompagnent dans l&apos;aventure
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto text-left">
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>{siteConfig.sponsor.name}</span>
            </div>
            <p className="text-xs text-[#CBD5E1]">
              Sponsor officiel accompagnant nos cérémonies académiques, trophées d&apos;éloquence et tournages podcasts.
            </p>
          </div>

          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
              <Heart className="w-4 h-4 text-[#D4AF37]" />
              <span>{siteConfig.partnerClub.name}</span>
            </div>
            <p className="text-xs text-[#CBD5E1]">
              Club partenaire co-producteur du Let&apos;s Talk Podcast et allié engagé dans l&apos;animation de la vie étudiante.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
