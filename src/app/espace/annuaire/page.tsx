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

  // The annuaire lists validated members only — guests wait for approval.
  if (profile.role === "guest") {
    return (
      <div className="pt-10 sm:pt-14 pb-16 px-4 max-w-xl mx-auto">
        <div className="glass-card rounded-lg border border-[#755B18]/30 p-8 sm:p-10 text-center space-y-4">
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#16233A]">
            Annuaire des Membres
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6672] leading-relaxed">
            L&apos;annuaire est réservé aux membres validés du club. Votre compte est en
            attente de validation par le bureau — vous serez notifié dès votre approbation.
          </p>
        </div>
      </div>
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
