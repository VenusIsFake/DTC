import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

// Readable, copy-pasteable temp credentials (no ambiguous chars).
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
// Rejection sampling: a plain `byte % length` would favor the first
// (256 % length) indices — negligible risk, but free to get right.
function randomIndex(length: number): number {
  const limit = 256 - (256 % length);
  for (;;) {
    const byte = randomBytes(1)[0];
    if (byte < limit) return byte % length;
  }
}
function tempPassword(): string {
  const body = Array.from({ length: 12 }, () => ALPHABET[randomIndex(ALPHABET.length)]).join("");
  return `Dtc-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

/**
 * POST /api/admin/users  { action: "create" | "reset_password" | "delete", ... }
 * Admin session required. Uses the service-role client (server-side key only)
 * so account lifecycle no longer needs the Supabase dashboard. Temp passwords
 * are generated server-side, returned once, and shown once in the console —
 * the member changes theirs from "Mon espace".
 */
export async function POST(request: NextRequest) {
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
  if (!profile || profile.role !== "admin" || profile.is_banned) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const service = getSupabaseServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Clé service_role non configurée sur le serveur (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  // Defense in depth against cross-site form posts: only accept real JSON.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  let body: { action?: string; email?: string; full_name?: string; role?: string; user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (body.action === "create") {
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.full_name ?? "").trim();
    const role = body.role === "bureau" || body.role === "admin" ? body.role : "member";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    const password = tempPassword();
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createError || !created?.user) {
      console.error("users create:", createError);
      const message = /already|registered|exists/i.test(createError?.message ?? "")
        ? "Un compte existe déjà avec cet email."
        : "Création impossible.";
      return NextResponse.json({ error: message }, { status: 409 });
    }
    // handle_new_user already inserted the profile (role member) — set the real role.
    const { error: roleError } = await service
      .from("profiles")
      .update({ role, ...(fullName ? { full_name: fullName } : {}) })
      .eq("id", created.user.id);
    if (roleError) {
      console.error("users role apply:", roleError);
      return NextResponse.json({ error: "Compte créé mais rôle non appliqué." }, { status: 207 });
    }
    return NextResponse.json({ email, password });
  }

  if (body.action === "reset_password") {
    const userId = String(body.user_id ?? "");
    if (!userId) return NextResponse.json({ error: "Compte introuvable." }, { status: 400 });
    if (userId === profile.id) {
      return NextResponse.json(
        { error: "Pour votre propre mot de passe, utilisez « Mon espace »." },
        { status: 400 }
      );
    }
    // One admin must not be able to silently take over another admin's
    // account (temp password is returned in the response). Demote first.
    const { data: target } = await service.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (target?.role === "admin") {
      return NextResponse.json(
        { error: "Impossible de réinitialiser le mot de passe d'un autre administrateur — rétrogradez-le d'abord (rôle bureau)." },
        { status: 403 }
      );
    }
    const password = tempPassword();
    const { error: updateError } = await service.auth.admin.updateUserById(userId, { password });
    if (updateError) {
      console.error("users reset_password:", updateError);
      return NextResponse.json({ error: "Réinitialisation impossible." }, { status: 502 });
    }
    return NextResponse.json({ password });
  }

  if (body.action === "delete") {
    const userId = String(body.user_id ?? "");
    if (!userId) return NextResponse.json({ error: "Compte introuvable." }, { status: 400 });
    if (userId === profile.id) {
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte." }, { status: 400 });
    }
    const { error: deleteError } = await service.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("users delete:", deleteError);
      return NextResponse.json({ error: "Suppression impossible." }, { status: 502 });
    }
    // profiles row cascades (FK on delete cascade); authored content keeps
    // author_id set to null by its own FK policy.
    return NextResponse.json({ deleted: true });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
