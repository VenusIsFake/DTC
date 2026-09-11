"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Activity, Users, ShieldAlert } from "lucide-react";
import type { Committee, Profile, SiteSettings } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import ProfileEditor from "@/components/espace/ProfileEditor";
import ActivitiesPanel from "@/components/espace/ActivitiesPanel";
import PasswordChangeCard from "@/components/espace/PasswordChangeCard";

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
    <div className="pt-10 sm:pt-14 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-dtc-gold">
          Espace Membre
        </p>
        <h1 className="font-heading font-semibold text-3xl sm:text-4xl text-dtc-ink tracking-tight">
          Bonjour, {profile.full_name?.split(" ")[0] || "membre"}
        </h1>
        {isBanned && (
          <p className="flex items-center gap-1.5 text-xs text-red-700 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" />
            Votre compte est suspendu : contactez le bureau pour le réactiver.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-md bg-white border border-dtc-line w-fit">
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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-[11px] sm:text-xs font-semibold transition-colors ${
              tab === option.id
                ? "bg-dtc-wash text-dtc-gold"
                : "text-dtc-inkMuted hover:text-dtc-ink"
            }`}
          >
            <option.icon className="w-3.5 h-3.5" />
            <span>{option.label}</span>
          </button>
        ))}
        <Link
          href="/espace/annuaire"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-[11px] sm:text-xs font-semibold text-dtc-inkMuted hover:text-dtc-ink transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Annuaire</span>
        </Link>
      </div>

      {tab === "profil" ? (
        <div className="space-y-4 sm:space-y-6">
          <ProfileEditor profile={profile} committees={committees} settings={settings} />
          <PasswordChangeCard />
        </div>
      ) : (
        <ActivitiesPanel />
      )}

      {isBureau && tab === "profil" && (
        <p className="text-[11px] text-dtc-inkSoft text-center">
          Membre du bureau : vos outils de gestion se trouvent directement dans les fils{" "}
          <Link href="/annonces" className="text-dtc-gold hover:underline underline-offset-2">
            Annonces
          </Link>{" "}
          et{" "}
          <Link href="/idees" className="text-dtc-gold hover:underline underline-offset-2">
            Idées
          </Link>
          .
        </p>
      )}
    </div>
  );
}
