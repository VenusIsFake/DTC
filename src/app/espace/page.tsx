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

  const [settings, committees] = await Promise.all([getSiteSettings(), getCommittees()]);

  return <EspaceClient profile={profile} committees={committees} settings={settings} />;
}
