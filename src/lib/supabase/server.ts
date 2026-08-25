import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./client";

/**
 * Server-side Supabase client bound to the request cookies (server
 * components, route handlers). Returns null when Supabase is not
 * configured so callers can degrade to static content. Async since
 * Next 15 (cookies() must be awaited).
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot mutate cookies; the browser client
          // refreshes the session and sets them on its side.
        }
      },
    },
  });
}
