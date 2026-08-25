import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { escapeHtml, formatDateTime } from "@/lib/format";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dentalkclub-fmdc.vercel.app";

interface BroadcastEmailRow {
  email: string;
}

function emailHtml(input: {
  title: string;
  body: string;
  dateLine: string | null;
  location: string | null;
}): string {
  const paragraphs = input.body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px">${escapeHtml(p).replaceAll("\n", "<br/>")}</p>`)
    .join("");
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#0B132B;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B132B;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#101C33;border:1px solid #385A75;border-radius:16px">
        <tr><td style="padding:24px 28px 8px;text-align:center">
          <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(212,175,55,.15);color:#D4AF37;font-size:11px;font-weight:bold;letter-spacing:.08em">DENTALK CLUB FMDC</span>
          <h1 style="margin:16px 0 8px;color:#ffffff;font-size:22px;line-height:1.3">${escapeHtml(input.title)}</h1>
          ${input.dateLine ? `<p style="margin:0 0 4px;color:#D4AF37;font-size:13px;font-weight:bold">📅 ${escapeHtml(input.dateLine)}</p>` : ""}
          ${input.location ? `<p style="margin:0 0 4px;color:#94A3B8;font-size:13px">📍 ${escapeHtml(input.location)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:8px 28px 4px;color:#CBD5E1;font-size:14px;line-height:1.6">${paragraphs}</td></tr>
        <tr><td style="padding:16px 28px 28px" align="center">
          <a href="${SITE_URL}/annonces" style="display:inline-block;padding:12px 28px;border-radius:999px;background:#D4AF37;color:#0B132B;font-size:13px;font-weight:bold;text-decoration:none">Voir sur le site du club</a>
        </td></tr>
        <tr><td style="padding:0 28px 20px;text-align:center;color:#64748B;font-size:11px;line-height:1.5">
          Vous recevez cet email car vous êtes membre de l'espace DTC.<br/>
          <a href="${SITE_URL}/espace" style="color:#94A3B8">Gérer mon compte</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * POST /api/admin/email-broadcast  { announcement_id }
 * Bureau+ session required. Sends the published announcement to every member
 * email via Resend (BCC, batches of 50). Requires RESEND_API_KEY — the
 * feature is dormant (503 with guidance) until the dev configures it, see
 * docs/platform/deployment.md § Email.
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
  if (!profile || (profile.role !== "bureau" && profile.role !== "admin") || profile.is_banned) {
    return NextResponse.json({ error: "Accès réservé au bureau" }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Envoi d'emails non configuré : ajoutez RESEND_API_KEY (voir docs/platform/deployment.md § Email).",
      },
      { status: 503 }
    );
  }

  let announcementId = "";
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    const body = (await request.json()) as { announcement_id?: string };
    announcementId = body.announcement_id ?? "";
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { data: announcement } = await supabase
    .from("announcements")
    .select("title, body, event_date, location, status")
    .eq("id", announcementId)
    .maybeSingle();
  if (!announcement) {
    return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
  }
  if (announcement.status !== "published") {
    return NextResponse.json({ error: "Publiez l'annonce avant de l'envoyer par email." }, { status: 400 });
  }

  // Recipients: every member email (bureau-list RPC re-checks bureau role in DB).
  const { data: recipients, error: recipientsError } = await supabase.rpc("bureau_list_profiles");
  if (recipientsError) throw recipientsError;
  const emails = ((recipients as unknown as BroadcastEmailRow[] | null) ?? [])
    .map((r) => r.email)
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (emails.length === 0) {
    return NextResponse.json({ error: "Aucun membre avec un email valide." }, { status: 400 });
  }

  const subject = `${announcement.title}${announcement.event_date ? ` — ${formatDateTime(announcement.event_date)}` : ""}`;
  const html = emailHtml({
    title: announcement.title,
    body: announcement.body,
    dateLine: announcement.event_date ? formatDateTime(announcement.event_date) : null,
    location: announcement.location || null,
  });
  const from = process.env.EMAIL_FROM ?? "Dentalk Club FMDC <onboarding@resend.dev>";

  let sent = 0;
  const failures: number[] = [];
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [from], bcc: batch, subject, html }),
    });
    if (response.ok) sent += batch.length;
    else failures.push(response.status);
  }

  if (sent === 0) {
    return NextResponse.json(
      { error: `Échec de l'envoi (Resend ${failures[0] ?? "?"}). Vérifiez RESEND_API_KEY / EMAIL_FROM.` },
      { status: 502 }
    );
  }
  return NextResponse.json({ sent, failed_batches: failures.length });
}
