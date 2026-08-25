// Realtime E2E probe: subscribe as anon, expect INSERT/UPDATE events on
// announcements (RLS delivers published rows to anon). Exits 0 on success.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("MISSING_ENV");
  process.exit(2);
}
const supabase = createClient(url, key);

const seen = [];
const timeout = setTimeout(() => {
  console.error(seen.length ? "PARTIAL" : "NO_EVENTS", JSON.stringify(seen));
  process.exit(1);
}, 20000);

const channel = supabase
  .channel("e2e-audit")
  .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, (payload) => {
    seen.push({ event: payload.eventType, title: payload.new?.title ?? payload.old?.title });
    console.log("EVENT:", payload.eventType, payload.new?.title ?? payload.old?.title);
    if (seen.length >= 2) {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
      console.log("PASS", JSON.stringify(seen));
      process.exit(0);
    }
  })
  .subscribe((status) => console.log("STATUS:", status));
