"use client";

import React from "react";
import { LogIn, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

/** Friendly login wall for member-only pages (opens the shared AuthModal). */
export default function SignInPrompt({ title, description }: { title: string; description: string }) {
  const { dbReady, openAuth } = useAuth();

  return (
    <div className="pt-8 sm:pt-12 pb-10 sm:pb-20 px-4 sm:px-6 max-w-xl mx-auto">
      <div className="glass-card rounded-lg border border-[#DCD7CB]/40 p-8 sm:p-12 text-center space-y-4">
        <div className="inline-flex p-3 rounded-lg bg-[#755B18]/15 text-[#755B18]">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#16233A]">{title}</h1>
        <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed max-w-sm mx-auto">{description}</p>
        {dbReady ? (
          <button
            onClick={() => openAuth()}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-md font-bold text-sm bg-[#755B18] text-[#F7F5F0] hover:brightness-110 shadow-lg shadow-[#755B18]/20 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter</span>
          </button>
        ) : (
          <p className="text-xs text-[#5F6774]">Espace membre indisponible : base de données non configurée.</p>
        )}
      </div>
    </div>
  );
}
