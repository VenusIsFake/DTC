import React from "react";
import Image from "next/image";
import { MailX, Megaphone } from "lucide-react";
import { getOpenRecruitment, getServerProfile } from "@/lib/data";
import { siteConfig } from "@/data/siteConfig";
import CandidatureForm from "@/components/candidature/CandidatureForm";
import BureauSignIn from "@/components/candidature/BureauSignIn";

// Link-only form portal (no site chrome — see SiteChrome). Kept out of search
// engines so it stays as private as the Google Form it replaces.
export const metadata = {
  // absolute: the root template would otherwise append the brand a second time
  title: { absolute: "Candidature — Dentalk Club FMDC" },
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
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-dtc-line shrink-0">
          <Image
            src={siteConfig.assetUrl("/logo.png")}
            alt="Dentalk Club FMDC"
            fill
            sizes="36px"
            className="object-cover"
            priority
          />
        </div>
        <div className="leading-tight">
          <span className="font-heading text-[15px] sm:text-base text-dtc-ink">
            Dentalk <span className="text-dtc-gold">Club</span>
          </span>
          <span className="block text-[10px] sm:text-[11px] text-dtc-inkMuted tracking-[0.14em] uppercase">
            FMDC Casablanca
          </span>
        </div>
      </div>

      {!open ? (
        <div className="glass-card rounded-xl border border-dtc-line/40 p-8 sm:p-12 text-center space-y-4">
          <div className="inline-flex p-3 rounded-lg bg-dtc-wash text-dtc-gold">
            <MailX className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-dtc-ink">
            Aucun appel à candidatures en cours
          </h1>
          <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed max-w-md mx-auto">
            Les candidatures au bureau du Dentalk Club sont actuellement fermées. Revenez sur ce
            même lien lorsque le bureau rouvre un appel.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <p className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-dtc-gold">
              <Megaphone className="w-3.5 h-3.5" />
              Candidatures ouvertes
            </p>
            <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-dtc-ink tracking-tight leading-snug">
              {open.recruitment.title}
            </h1>
          </div>

          <div className="space-y-3.5 text-sm text-dtc-lineDark leading-relaxed text-left sm:text-center">
            {open.recruitment.intro
              .split(/\n{2,}/)
              .filter((p) => p.trim() !== "")
              .map((paragraph, i) => (
                <p key={i} className={i === 0 ? "font-semibold text-dtc-ink" : undefined}>
                  {paragraph}
                </p>
              ))}
          </div>

          {open.positions.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold tracking-[0.14em] uppercase text-dtc-gold text-left sm:text-center">
                Postes ouverts
              </h2>
              <div className="flex flex-wrap justify-center gap-2.5">
                {open.positions.map((position) => (
                  <div
                    key={position.id}
                    className="px-4 py-2.5 rounded-xl bg-white border border-dtc-gold/30 shadow-sm"
                  >
                    <p className="text-sm font-bold text-dtc-ink">{position.title}</p>
                    {position.description && (
                      <p className="text-xs text-dtc-inkMuted mt-0.5 max-w-md">
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

      <p className="text-center text-[10px] text-dtc-inkMuted">
        Formulaire officiel du Dentalk Club FMDC — réservé aux membres invités par le bureau.
      </p>
      <BureauSignIn />
    </div>
  );
}
