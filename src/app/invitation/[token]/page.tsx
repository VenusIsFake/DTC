import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getMembershipSettings, getSiteSettings } from "@/lib/data";
import InvitationClient from "@/components/invitation/InvitationClient";

export const metadata = {
  title: "Inscription & Adhésion — DTC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * One-time invitation page & stand QR flow (wall-exempt, chrome-less).
 * Server checks link status and preloads membership + site settings.
 */
export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let status = "invalid";

  // Tokens are 64 lowercase hex chars — anything else needs no DB round trip.
  if (isSupabaseConfigured() && /^[0-9a-f]{64}$/.test(token)) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase.rpc("invite_link_status", { p_token: token });
      if (typeof data === "string") status = data;
    }
  }

  const [membershipSettings, siteSettings] = await Promise.all([
    getMembershipSettings(),
    getSiteSettings(),
  ]);

  return (
    <InvitationClient
      token={token}
      status={status}
      membershipSettings={membershipSettings}
      siteSettings={siteSettings}
    />
  );
}
