"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Activity, Users, ShieldAlert } from "lucide-react";
import type { Committee, Profile, SiteSettings } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import ProfileEditor from "@/components/espace/ProfileEditor";
import ActivitiesPanel from "@/components/espace/ActivitiesPanel";

type Tab = "profil" | "activites";

export default function EspaceClient({
  profile,
  committees,
  settings,
}: {
  profile: Profile;
  committees: Committee[];
  settings: SiteSettings;
}) {
  const { isBanned, isBureau } = useAuth();
  const [tab, setTab] = useState<Tab>("profil");

  return (
    <div className="pt-16 sm:pt-28 pb-10 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          <User className="w-3.5 h-3.5" />
          <span>Espace Membre</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
          Bonjour, <span className="gold-gradient-text">{profile.full_name?.split(" ")[0] || "membre"}</span>
        </h1>
        {isBanned && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" />
            Votre compte est suspendu : contactez le bureau pour le réactiver.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0F172A]/80 border border-[#385A75]/40 w-fit">
        {(
          [
            { id: "profil", label: "Mon profil", icon: User },
            { id: "activites", label: "Mes activités", icon: Activity },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            onClick={() => setTab(option.id)}
            aria-pressed={tab === option.id}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all ${
              tab === option.id
                ? "bg-[#1B2E4B] text-[#D4AF37] border border-[#D4AF37]/30"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <option.icon className="w-3.5 h-3.5" />
            <span>{option.label}</span>
          </button>
        ))}
        <Link
          href="/espace/annuaire"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] sm:text-xs font-semibold text-[#94A3B8] hover:text-white transition-all"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Annuaire</span>
        </Link>
      </div>

      {tab === "profil" ? (
        <ProfileEditor profile={profile} committees={committees} settings={settings} />
      ) : (
        <ActivitiesPanel />
      )}

      {isBureau && tab === "profil" && (
        <p className="text-[11px] text-[#64748B] text-center">
          Membre du bureau : vos outils de gestion se trouvent directement dans les fils{" "}
          <Link href="/annonces" className="text-[#D4AF37] hover:underline underline-offset-2">
            Annonces
          </Link>{" "}
          et{" "}
          <Link href="/idees" className="text-[#D4AF37] hover:underline underline-offset-2">
            Idées
          </Link>
          .
        </p>
      )}
    </div>
  );
}
