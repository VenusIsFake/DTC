import React from "react";
import Image from "next/image";
import InfographicViewer from "@/components/InfographicViewer";
import { siteConfig } from "@/data/siteConfig";
import { getAboutSections, getMandates, getSiteSettings } from "@/lib/data";
import type { MandateWithMembers } from "@/lib/types";
import { Award, Heart, Crown } from "lucide-react";
import Reveal from "@/components/Reveal";
import UserAvatar from "@/components/UserAvatar";

export const metadata = {
  title: "À Propos",
  description: "Découvrez l'histoire, la gouvernance et la mission de Dentalk Club FMDC.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const [sections, mandates, settings] = await Promise.all([
    getAboutSections(),
    getMandates(),
    getSiteSettings(),
  ]);
  const current = mandates.find((m) => m.is_current) ?? mandates[0];
  const archived = mandates.filter((m) => m.id !== current?.id);
  const mission = sections.find((s) => s.key === "mission");
  const sponsor = settings.sponsor ?? siteConfig.sponsor;
  const partnerClub = settings.partner_club ?? siteConfig.partnerClub;

  return (
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-14">
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto space-y-2 sm:space-y-4">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">
          Histoire, Vision &amp; Gouvernance
        </p>
        <h1 className="font-heading font-semibold text-3xl sm:text-5xl text-[#16233A] tracking-tight">
          À Propos de Dentalk Club
        </h1>
        <p className="text-xs sm:text-base text-[#5C6672] leading-relaxed">
          {settings.about_intro ||
            "Fondé en novembre 2024 à la Faculté de Médecine Dentaire de Casablanca pour forger les futurs leaders de l'art dentaire."}
        </p>
      </div>

      {/* 1. Mission (first section keeps its illustrated layout) */}
      {mission && (
        <Reveal>
        <section className="glass-card p-4 sm:p-12 rounded-lg border border-[#DCD7CB]/40 shadow-lg relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-xl sm:text-3xl font-heading font-bold text-[#16233A] leading-tight">
                  {mission.title}
                </h2>
                {mission.body.split("\n\n").map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "text-xs sm:text-base text-[#3D4A58] leading-relaxed"
                        : "text-xs sm:text-sm text-[#5C6672] leading-relaxed"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-lg bg-[#EFECE4]/50 border border-[#DCD7CB]/40 space-y-0.5 sm:space-y-1">
                  <span className="text-[10px] sm:text-xs text-[#5C6672] block">Fondation</span>
                  <span className="text-xs sm:text-sm font-bold text-[#16233A]">Nov 2024</span>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-lg bg-[#EFECE4]/50 border border-[#DCD7CB]/40 space-y-0.5 sm:space-y-1">
                  <span className="text-[10px] sm:text-xs text-[#5C6672] block">Institution</span>
                  <span className="text-xs sm:text-sm font-bold text-[#16233A]">FMDC Casa</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-36 h-36 sm:w-72 sm:h-72 rounded-full p-1.5 border border-[#DCD7CB]">
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#755B18]/50">
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
        </Reveal>
      )}

      {/* 2. Official executive infographic (current mandate) */}
      {current && (
        <InfographicViewer imageUrl={current.infographic_url || undefined} label={current.year_label} />
      )}

      {/* 3. Current mandate team */}
      {current && current.members.length > 0 && (
        <Reveal>
        <section className="space-y-4 sm:space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#755B18]">
              <Crown className="w-3.5 h-3.5" />
              <span>Bureau Exécutif — {current.year_label}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-heading font-bold text-[#16233A]">
              L&apos;équipe en exercice
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {current.members.map((member) => (
              <div
                key={member.id}
                className="glass-card p-3 sm:p-5 rounded-xl sm:rounded-lg border border-[#DCD7CB]/30 text-center space-y-1 flex flex-col justify-between"
              >
                <UserAvatar name={member.name} src={member.photo_url} size={64} className="mx-auto" />
                <h3 className="text-xs sm:text-sm font-heading font-bold text-[#16233A] leading-snug">
                  {member.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#755B18] font-semibold">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
        </Reveal>
      )}

      {/* 4. Remaining editable prose sections (poles, partners, …) */}
      {sections
        .filter((s) => s.key !== "mission")
        .map((section) => (
          <Reveal key={section.id}>
          <section
            className="glass-card p-4 sm:p-10 rounded-lg border border-[#DCD7CB]/40 space-y-4"
          >
            {section.key === "partners" ? (
              <div className="space-y-4 sm:space-y-8 text-center">
                <div className="max-w-xl mx-auto space-y-1 sm:space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#755B18]">
                    <Award className="w-3.5 h-3.5" />
                    <span>Partenaires & Soutiens</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#16233A]">{section.title}</h2>
                </div>
                <p className="text-xs text-[#3D4A58] max-w-xl mx-auto leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto text-left">
                  {sponsor.name && (
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-lg bg-[#EFECE4]/50 border border-[#DCD7CB]/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#16233A] font-bold text-base sm:text-lg">
                      <Award className="w-4 h-4 text-[#755B18]" />
                      <span>{sponsor.name}</span>
                    </div>
                    <p className="text-xs text-[#3D4A58]">{sponsor.tagline}</p>
                  </div>
                  )}
                  {partnerClub.name && (
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-lg bg-[#EFECE4]/50 border border-[#DCD7CB]/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#16233A] font-bold text-base sm:text-lg">
                      <Heart className="w-4 h-4 text-[#755B18]" />
                      <span>{partnerClub.name}</span>
                    </div>
                    <p className="text-xs text-[#3D4A58]">{partnerClub.tagline}</p>
                  </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#16233A]">{section.title}</h2>
                {section.body.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="text-xs sm:text-sm text-[#3D4A58] leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </section>
          </Reveal>
        ))}

      {/* 5. Archived mandates (history never deleted) */}
      {archived.length > 0 && (
        <Reveal>
        <section className="space-y-4 sm:space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6672]">
              <Crown className="w-3.5 h-3.5" />
              <span>Archives du club</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#16233A]">Mandats précédents</h2>
          </div>
          {archived.map((mandate) => (
            <ArchivedMandate key={mandate.id} mandate={mandate} />
          ))}
        </section>
        </Reveal>
      )}
    </div>
  );
}

function ArchivedMandate({ mandate }: { mandate: MandateWithMembers }) {
  return (
    <details className="glass-card rounded-lg border border-[#DCD7CB]/30 overflow-hidden group">
      <summary className="flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer list-none">
        <div className="flex items-center gap-2.5">
          <Crown className="w-4 h-4 text-[#5C6672]" />
          <span className="text-sm sm:text-base font-heading font-bold text-[#16233A]">{mandate.year_label}</span>
        </div>
        <span className="text-[11px] text-[#5C6672]">{mandate.members.length} membres</span>
      </summary>
      <div className="px-4 sm:px-5 pb-5 space-y-3">
        {mandate.infographic_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DCD7CB]/40">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#EFECE4]/50 border border-[#DCD7CB]/40 text-[11px]"
            >
              <UserAvatar name={member.name} src={member.photo_url} size={20} />
              <span className="font-semibold text-[#16233A]">{member.name}</span>
              <span className="text-[#755B18]">{member.role}</span>
            </span>
          ))}
        </div>
      </div>
    </details>
  );
}
