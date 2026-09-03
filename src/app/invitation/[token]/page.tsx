import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import InvitationClient from "@/components/invitation/InvitationClient";

export const metadata = {
  title: "Invitation — DTC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * One-time invitation page (wall-exempt, chrome-less). The token is checked
 * server-side so an invalid/used/expired link never shows the signup form;
 * redemption itself happens client-side after authentication.
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
  return <InvitationClient token={token} status={status} />;
}
