import React from "react";
import Image from "next/image";
import { MailX, Megaphone } from "lucide-react";
import { getOpenRecruitment, getServerProfile } from "@/lib/data";
import CandidatureForm from "@/components/candidature/CandidatureForm";
import BureauSignIn from "@/components/candidature/BureauSignIn";

// Link-only form portal (no site chrome — see SiteChrome). Kept out of search
// engines so it stays as private as the Google Form it replaces.
export const metadata = {
  title: "Candidature — Dentalk Club FMDC",
  description:
    "Formulaire officiel de candidature au bureau du Dentalk Club FMDC (lien partagé par le bureau).",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/candidature",
  },
};

export default async function CandidaturePage() {
  const [open, profile] = await Promise.all([getOpenRecruitment(), getServerProfile()]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-12 sm:pb-16 space-y-7 sm:space-y-8">
      {/* Inert brand mark — same identity as the site, but not a link: form
          recipients get no path into the main website. */}
      <div className="flex items-center justify-center gap-2.5">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#DCD7CB] shrink-0">
          <Image
            src="/logo.png"
            alt="Dentalk Club FMDC"
            fill
            sizes="36px"
            className="object-cover"
            priority
          />
        </div>
        <div className="leading-tight">
          <span className="font-heading text-[15px] sm:text-base text-[#16233A]">
            Dentalk <span className="text-[#755B18]">Club</span>
          </span>
          <span className="block text-[10px] sm:text-[11px] text-[#5C6672] tracking-[0.14em] uppercase">
            FMDC Casablanca
          </span>
        </div>
      </div>

      {!open ? (
        <div className="glass-card rounded-xl border border-[#DCD7CB]/40 p-8 sm:p-12 text-center space-y-4">
          <div className="inline-flex p-3 rounded-lg bg-[#EFECE4] text-[#755B18]">
            <MailX className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#16233A]">
            Aucun appel à candidatures en cours
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed max-w-md mx-auto">
            Les candidatures au bureau du Dentalk Club sont actuellement fermées. Revenez sur ce
            même lien lorsque le bureau rouvre un appel.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <p className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#755B18]">
              <Megaphone className="w-3.5 h-3.5" />
              Candidatures ouvertes
            </p>
            <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-[#16233A] tracking-tight leading-snug">
              {open.recruitment.title}
            </h1>
          </div>

          <div className="space-y-3.5 text-sm text-[#3D4A58] leading-relaxed text-left sm:text-center">
            {open.recruitment.intro
              .split(/\n{2,}/)
              .filter((p) => p.trim() !== "")
              .map((paragraph, i) => (
                <p key={i} className={i === 0 ? "font-semibold text-[#16233A]" : undefined}>
                  {paragraph}
                </p>
              ))}
          </div>

          {open.positions.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold tracking-[0.14em] uppercase text-[#755B18] text-left sm:text-center">
                Postes ouverts
              </h2>
              <div className="flex flex-wrap justify-center gap-2.5">
                {open.positions.map((position) => (
                  <div
                    key={position.id}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#755B18]/30 shadow-sm"
                  >
                    <p className="text-sm font-bold text-[#16233A]">{position.title}</p>
                    {position.description && (
                      <p className="text-xs text-[#5C6672] mt-0.5 max-w-md">
                        {position.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <CandidatureForm
            recruitmentId={open.recruitment.id}
            positions={open.positions.map((p) => ({ id: p.id, title: p.title }))}
            defaultName={profile?.full_name || ""}
            defaultPhone={profile?.phone || ""}
          />
        </>
      )}

      <p className="text-center text-[10px] text-[#5C6672]">
        Formulaire officiel du Dentalk Club FMDC — réservé aux membres invités par le bureau.
      </p>
      <BureauSignIn />
    </div>
  );
}
