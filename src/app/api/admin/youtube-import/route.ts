import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseYouTubeId } from "@/lib/format";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

interface YouTubeVideoResponse {
  items?: {
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: Record<string, { url: string } | undefined>;
    };
    contentDetails: { duration: string };
  }[];
}

/** ISO-8601 duration (PT1H2M3S) → "1:02:03" / "42:30". */
function isoDurationToClock(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/**
 * POST /api/admin/youtube-import  { url }
 * Bureau+ session required. Fetches video metadata from the YouTube Data API
 * v3 (server-side key, never NEXT_PUBLIC) and returns pre-filled episode data.
 */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
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

  let url = "";
  try {
    const body = (await request.json()) as { url?: string };
    url = body.url ?? "";
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const videoId = parseYouTubeId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "Lien YouTube invalide — collez l'URL de la vidéo (watch, youtu.be ou shorts)." },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY manquante côté serveur (voir docs/platform/deployment.md)." },
      { status: 503 }
    );
  }

  try {
    const api = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(api, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { error: `YouTube API a répondu ${response.status}` },
        { status: 502 }
      );
    }
    const payload = (await response.json()) as YouTubeVideoResponse;
    const item = payload.items?.[0];
    if (!item) {
      return NextResponse.json({ error: "Vidéo introuvable (privée ou supprimée)." }, { status: 404 });
    }

    const thumbnail =
      item.snippet.thumbnails.maxres?.url ??
      item.snippet.thumbnails.standard?.url ??
      item.snippet.thumbnails.high?.url ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const releaseDate = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(item.snippet.publishedAt));

    return NextResponse.json({
      youtube_id: videoId,
      title: item.snippet.title,
      description: item.snippet.description.slice(0, 2000),
      thumbnail,
      duration: isoDurationToClock(item.contentDetails.duration),
      release_date: releaseDate.charAt(0).toUpperCase() + releaseDate.slice(1),
    });
  } catch {
    return NextResponse.json({ error: "Échec de l'appel à l'API YouTube." }, { status: 502 });
  }
}
