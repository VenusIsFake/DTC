import React from "react";
import { getSiteSettings, getCommittees, getServerProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import SignInPrompt from "@/components/auth/SignInPrompt";
import EspaceClient from "@/components/espace/EspaceClient";

export const metadata = {
  title: "Mon Espace",
  description: "Votre espace membre DTC : profil, activités, votes et participations.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function EspacePage() {
  if (!isSupabaseConfigured()) {
    return (
      <SignInPrompt
        title="Espace membre indisponible"
        description="La base de données du club n'est pas encore configurée. Revenez bientôt !"
      />
    );
  }

  const profile = await getServerProfile();
  if (!profile) {
    return (
      <SignInPrompt
        title="Espace Membre DTC"
        description="Connectez-vous pour gérer votre profil, suivre vos votes, vos idées et vos participations aux ateliers."
      />
    );
  }

  // Self-registered accounts start as guests — they can look around the
  // public site, but the member space opens only after bureau approval.
  if (profile.role === "guest") {
    return (
      <div className="pt-10 sm:pt-14 pb-16 px-4 max-w-xl mx-auto">
        <div className="glass-card rounded-lg border border-[#755B18]/30 p-8 sm:p-10 text-center space-y-4">
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#16233A]">
            Compte en attente de validation
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed">
            Bienvenue au DTC ! Votre compte a bien été créé, mais l&apos;accès à l&apos;espace
            membre est accordé par le bureau du club après vérification. Vous pouvez
            consulter librement les pages publiques du site en attendant — le bureau est
            averti de votre inscription dans la console.
          </p>
        </div>
      </div>
    );
  }

  const [settings, committees] = await Promise.all([getSiteSettings(), getCommittees()]);

  return <EspaceClient profile={profile} committees={committees} settings={settings} />;
}
