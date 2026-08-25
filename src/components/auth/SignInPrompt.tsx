"use client";

import React from "react";
import { LogIn, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

/** Friendly login wall for member-only pages (opens the shared AuthModal). */
export default function SignInPrompt({ title, description }: { title: string; description: string }) {
  const { dbReady, openAuth } = useAuth();

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 max-w-xl mx-auto">
      <div className="glass-card rounded-2xl sm:rounded-3xl border border-[#385A75]/40 p-8 sm:p-12 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white">{title}</h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto">{description}</p>
        {dbReady ? (
          <button
            onClick={openAuth}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#0B132B] hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter</span>
          </button>
        ) : (
          <p className="text-xs text-[#64748B]">Espace membre indisponible : base de données non configurée.</p>
        )}
      </div>
    </div>
  );
}
