import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/config
 * Bureau+ session required. Tells the console which optional integrations are
 * live so their UI can show an explicit "key missing" badge instead of failing
 * silently on first use.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }
  const { data: profileData } = await supabase.rpc("my_profile");
  const profile = ((profileData as Profile[] | null) ?? [])[0];
  if (!profile || (profile.role !== "bureau" && profile.role !== "admin") || profile.is_banned) {
    return NextResponse.json({ error: "Accès réservé au bureau" }, { status: 403 });
  }

  return NextResponse.json({
    youtube: Boolean(process.env.YOUTUBE_API_KEY),
    resend: Boolean(process.env.RESEND_API_KEY),
  });
}
