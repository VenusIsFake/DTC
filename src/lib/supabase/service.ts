import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Service-role client (bypasses RLS) for admin API routes only. The key lives
 * server-side (Vercel env, never NEXT_PUBLIC_); the `server-only` import
 * makes any accidental client bundle fail at build time. Returns null when
 * the key is not configured so routes can answer a clear 503.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cached) {
    cached = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}
