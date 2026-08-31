import { getSupabaseBrowserClient, publicStorageUrl } from "@/lib/supabase/client";

/** Max upload size enforced by the club-media storage policy (25 MB). */
export const MAX_CLUB_IMAGE_BYTES = 26214400;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** Filesystem-safe path segment (ASCII-only so storage URLs stay clean). */
export function sanitizeFileName(name: string): string {
  const base = name.split("/").pop() ?? "image";
  return base.replace(/[^\w.\-]+/g, "-").slice(-80) || "image";
}

/** Client-side mirror of the club-media storage policy (fast, friendly errors). */
export function assertValidClubImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Format non supporté — JPG, PNG, WebP ou GIF uniquement.");
  }
  if (file.size > MAX_CLUB_IMAGE_BYTES) {
    throw new Error("Image trop lourde (max 25 Mo).");
  }
}

/**
 * Upload an image into the bureau-writable `club-media` bucket and return its
 * public URL. Shared by every console media field so validation, naming and
 * error wording stay identical everywhere.
 */
export async function uploadClubImage(file: File, folder: string): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Stockage non configuré.");
  assertValidClubImage(file);
  const path = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from("club-media").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return publicStorageUrl("club-media", path);
}

/** French wording for storage-policy rejections (size/mime) vs other errors. */
export function clubUploadErrorMessage(err: unknown): string {
  if (err instanceof Error && /size|mime|type/i.test(err.message)) {
    return "Image invalide ou trop lourde (max 25 Mo, JPG/PNG/WebP/GIF).";
  }
  return err instanceof Error && err.message ? err.message : "Upload impossible.";
}
