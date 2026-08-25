import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getServerProfile } from "@/lib/data";
import type { DirectoryEntry } from "@/lib/types";
import SignInPrompt from "@/components/auth/SignInPrompt";
import AnnuaireGrid from "@/components/espace/AnnuaireGrid";

export const metadata = {
  title: "Annuaire des Membres",
  description: "L'annuaire privé des membres du Dentalk Club FMDC.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AnnuairePage() {
  if (!isSupabaseConfigured()) {
    return (
      <SignInPrompt
        title="Annuaire indisponible"
        description="La base de données du club n'est pas encore configurée."
      />
    );
  }

  const profile = await getServerProfile();
  if (!profile) {
    return (
      <SignInPrompt
        title="Annuaire des Membres"
        description="L'annuaire est réservé aux membres connectés : photos, promos et commissions du club."
      />
    );
  }

  let entries: DirectoryEntry[] = [];
  let dbError = false;
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.rpc("member_directory");
      if (error) throw error;
      entries = (data as DirectoryEntry[] | null) ?? [];
    }
  } catch {
    dbError = true;
  }

  return <AnnuaireGrid initialEntries={entries} dbError={dbError} />;
}
