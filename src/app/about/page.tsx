import React from "react";
import Image from "next/image";
import InfographicViewer from "@/components/InfographicViewer";
import { siteConfig } from "@/data/siteConfig";
import { getAboutSections, getMandates } from "@/lib/data";
import type { MandateWithMembers } from "@/lib/types";
import { Sparkles, Award, Heart, Crown, Users } from "lucide-react";

export const metadata = {
  title: "À Propos",
  description: "Découvrez l'histoire, la gouvernance et la mission de Dentalk Club FMDC.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const [sections, mandates] = await Promise.all([getAboutSections(), getMandates()]);
  const current = mandates.find((m) => m.is_current) ?? mandates[0];
  const archived = mandates.filter((m) => m.id !== current?.id);
  const mission = sections.find((s) => s.key === "mission");

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
          Fondé en novembre 2024 à la Faculté de Médecine Dentaire de Casablanca pour forger les
          futurs leaders de l&apos;art dentaire.
        </p>
      </div>

      {/* 1. Mission (first section keeps its illustrated layout) */}
      {mission && (
        <section className="glass-card p-4 sm:p-12 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-xl sm:text-3xl font-heading font-bold text-white leading-tight">
                  {mission.title}
                </h2>
                {mission.body.split("\n\n").map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "text-xs sm:text-base text-[#CBD5E1] leading-relaxed"
                        : "text-xs sm:text-sm text-[#94A3B8] leading-relaxed"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-0.5 sm:space-y-1">
                  <span className="text-[10px] sm:text-xs text-[#94A3B8] block">Fondation</span>
                  <span className="text-xs sm:text-sm font-bold text-white">Nov 2024</span>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-0.5 sm:space-y-1">
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
      )}

      {/* 2. Official executive infographic (current mandate) */}
      {current && (
        <InfographicViewer imageUrl={current.infographic_url || undefined} label={current.year_label} />
      )}

      {/* 3. Current mandate team */}
      {current && current.members.length > 0 && (
        <section className="space-y-4 sm:space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
              <Crown className="w-3.5 h-3.5" />
              <span>Bureau Exécutif — {current.year_label}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-white">
              L&apos;équipe en <span className="gold-gradient-text">exercice</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {current.members.map((member) => (
              <div
                key={member.id}
                className="glass-card p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-[#385A75]/30 text-center space-y-1 flex flex-col justify-between"
              >
                <span className="inline-flex mx-auto p-2 rounded-lg bg-[#1B2E4B] text-[#D4AF37]">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs sm:text-sm font-heading font-bold text-white leading-snug">
                  {member.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#D4AF37] font-semibold">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Remaining editable prose sections (poles, partners, …) */}
      {sections
        .filter((s) => s.key !== "mission")
        .map((section) => (
          <section
            key={section.id}
            className="glass-card p-4 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#385A75]/40 space-y-4"
          >
            {section.key === "partners" ? (
              <div className="space-y-4 sm:space-y-8 text-center">
                <div className="max-w-xl mx-auto space-y-1 sm:space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
                    <Award className="w-3.5 h-3.5" />
                    <span>Partenaires & Soutiens</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">{section.title}</h2>
                </div>
                <p className="text-xs text-[#CBD5E1] max-w-xl mx-auto leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto text-left">
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
                      <Award className="w-4 h-4 text-[#D4AF37]" />
                      <span>{siteConfig.sponsor.name}</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1]">{siteConfig.sponsor.tagline}</p>
                  </div>
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#1B2E4B]/50 border border-[#385A75]/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
                      <Heart className="w-4 h-4 text-[#D4AF37]" />
                      <span>{siteConfig.partnerClub.name}</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1]">{siteConfig.partnerClub.tagline}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">{section.title}</h2>
                {section.body.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </section>
        ))}

      {/* 5. Archived mandates (history never deleted) */}
      {archived.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#94A3B8]">
              <Crown className="w-3.5 h-3.5" />
              <span>Archives du club</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">Mandats précédents</h2>
          </div>
          {archived.map((mandate) => (
            <ArchivedMandate key={mandate.id} mandate={mandate} />
          ))}
        </section>
      )}
    </div>
  );
}

function ArchivedMandate({ mandate }: { mandate: MandateWithMembers }) {
  return (
    <details className="glass-card rounded-2xl border border-[#385A75]/30 overflow-hidden group">
      <summary className="flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer list-none">
        <div className="flex items-center gap-2.5">
          <Crown className="w-4 h-4 text-[#94A3B8]" />
          <span className="text-sm sm:text-base font-heading font-bold text-white">{mandate.year_label}</span>
        </div>
        <span className="text-[11px] text-[#94A3B8]">{mandate.members.length} membres</span>
      </summary>
      <div className="px-4 sm:px-5 pb-5 space-y-3">
        {mandate.infographic_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#385A75]/40">
            <Image
              src={mandate.infographic_url}
              alt={`Organigramme ${mandate.year_label}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain bg-black/40"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {mandate.members.map((member) => (
            <span
              key={member.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1B2E4B]/50 border border-[#385A75]/40 text-[11px]"
            >
              <span className="font-semibold text-white">{member.name}</span>
              <span className="text-[#D4AF37]">{member.role}</span>
            </span>
          ))}
        </div>
      </div>
    </details>
  );
}
