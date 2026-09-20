import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import StandIcebreakerGame from "@/components/game/StandIcebreakerGame";

export const metadata = {
  title: "Mini-Jeu Stand — Dentalk Club FMDC",
  description:
    "Mini-jeu brise-glace pour le stand du Dentalk Club FMDC : 100 questions et dilemmes pour échanger avec les membres du bureau.",
  robots: { index: false, follow: false },
};

export default function StandGamePage() {
  return (
    <main className="min-h-screen bg-dtc-paper text-dtc-ink selection:bg-dtc-gold/20 py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle decorative background gradients */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-dtc-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-dtc-navy/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        {/* Top bar with logo and back link */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-dtc-inkMuted hover:text-dtc-ink transition-colors px-2.5 py-1.5 rounded-lg hover:bg-dtc-cream/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au site</span>
          </Link>

          <div className="flex items-center gap-2">
            <Image
              src="/logo.png?v=2026c"
              alt="Logo Dentalk Club FMDC"
              width={26}
              height={26}
              className="rounded-full shadow-sm"
            />
            <span className="font-heading font-bold text-xs text-dtc-ink tracking-tight hidden sm:inline">
              Dentalk Club FMDC
            </span>
          </div>
        </div>

        {/* Title & Introduction */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dtc-gold/15 border border-dtc-gold/30 text-dtc-ink text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-dtc-goldDark" />
            <span>Édition Stand & Accueil Nouveaux Membres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dtc-ink tracking-tight">
            Le Brise-Glace du Stand
          </h1>
          <p className="text-xs sm:text-sm text-dtc-inkMuted max-w-md mx-auto leading-relaxed">
            Tire une carte au hasard, partage ton avis ou pose la question aux
            membres du bureau présents devant toi au stand !
          </p>
        </div>

        {/* The Stand Icebreaker Game */}
        <div className="glass-card rounded-2xl border border-dtc-line/40 p-5 sm:p-7 shadow-lg">
          <StandIcebreakerGame />
        </div>

        {/* Stand Footer message */}
        <div className="text-center pt-2 text-xs text-dtc-inkMuted space-y-1">
          <p className="font-medium text-dtc-ink">
            Bienvenue au Dentalk Club FMDC Casablanca 🦷
          </p>
          <p className="text-[11px]">
            « Que ta voix résonne en échos sans fin. »
          </p>
        </div>
      </div>
    </main>
  );
}
