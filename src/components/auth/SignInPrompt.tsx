"use client";

import React from "react";
import { LogIn, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

/** Friendly login wall for member-only pages (opens the shared AuthModal). */
export default function SignInPrompt({ title, description }: { title: string; description: string }) {
  const { dbReady, openAuth } = useAuth();

  return (
    <div className="pt-8 sm:pt-12 pb-10 sm:pb-20 px-4 sm:px-6 max-w-xl mx-auto">
      <div className="glass-card rounded-lg border border-dtc-line/40 p-8 sm:p-12 text-center space-y-4">
        <div className="inline-flex p-3 rounded-lg bg-dtc-gold/15 text-dtc-gold">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-semibold text-dtc-ink">{title}</h1>
        <p className="text-xs sm:text-sm text-dtc-inkMuted leading-relaxed max-w-sm mx-auto">{description}</p>
        {dbReady ? (
          <button
            onClick={() => openAuth()}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-md font-bold text-sm bg-dtc-gold text-dtc-paper hover:brightness-110 shadow-lg shadow-dtc-gold/20 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter</span>
          </button>
        ) : (
          <p className="text-xs text-dtc-inkSoft">Espace membre indisponible : base de données non configurée.</p>
        )}
      </div>
    </div>
  );
}
