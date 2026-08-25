// Throwaway verification script — checks the live Supabase project against
// the expectations from supabase/schema.sql + seed.sql. Deleted after the run.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.log("ENV: missing SUPABASE url/key in .env.local");
  process.exit(1);
}

const results = [];
const check = (name, pass, detail) => results.push({ name, pass, detail });

const anon = createClient(url, key);

// --- seeded content (anon-readable) ---
const runs = [
  ["site_settings", async () => (await anon.from("site_settings").select("key")).data?.map((r) => r.key)],
  ["podcast_episodes", async () => (await anon.from("podcast_episodes").select("episode_number,is_published")).data],
  ["tedx_talks", async () => (await anon.from("tedx_talks").select("extract_number")).data],
  ["about_sections", async () => (await anon.from("about_sections").select("key,is_published")).data],
  ["mandates", async () => (await anon.from("mandates").select("year_label,is_current")).data],
  ["mandate_members", async () => (await anon.from("mandate_members").select("name")).data],
  ["announcement_board", async () => (await anon.from("announcement_board").select("id")).data],
  ["idea_board", async () => (await anon.from("idea_board").select("id")).data],
];

const data = {};
for (const [name, fn] of runs) {
  try {
    const value = await fn();
    data[name] = value;
    check(`read ${name}`, true, `${value?.length ?? "?"} rows`);
  } catch (err) {
    data[name] = null;
    check(`read ${name}`, false, String(err.message).slice(0, 120));
  }
}

check(
  "site_settings seeded",
  JSON.stringify(data.site_settings?.sort()) === JSON.stringify(["events_visible", "home_stats", "promo_years"]),
  String(data.site_settings)
);
check("podcast seeded (4 eps)", data.podcast_episodes?.length === 4, `${data.podcast_episodes?.length} eps`);
check(
  "podcast all published",
  data.podcast_episodes?.every((e) => e.is_published),
  ""
);
check("tedx seeded (8 talks)", data.tedx_talks?.length === 8, `${data.tedx_talks?.length} talks`);
check(
  "about seeded (3 sections)",
  data.about_sections?.length === 3 && data.about_sections.every((s) => s.is_published),
  `${data.about_sections?.length} sections`
);
check(
  "mandate seeded + current",
  data.mandates?.length === 1 && data.mandates[0]?.is_current === true,
  String(data.mandates)
);
check("mandate members (12)", data.mandate_members?.length === 12, `${data.mandate_members?.length} members`);

// --- security posture (anon must be denied) ---
const profilesAnon = await anon.from("profiles").select("id");
check(
  "profiles base table denied to anon",
  Boolean(profilesAnon.error),
  profilesAnon.error ? String(profilesAnon.error.message).slice(0, 100) : "!! anon could read profiles"
);

const dirAnon = await anon.rpc("member_directory");
check(
  "member_directory() denied to anon",
  Boolean(dirAnon.error),
  dirAnon.error ? String(dirAnon.error.message).slice(0, 100) : "!! anon could call member_directory"
);

const adminRoleAnon = await anon.rpc("admin_set_role", { target_id: "00000000-0000-0000-0000-000000000000", new_role: "admin" });
check(
  "admin_set_role() denied to anon",
  Boolean(adminRoleAnon.error),
  adminRoleAnon.error ? String(adminRoleAnon.error.message).slice(0, 100) : "!! anon could escalate"
);

// committees: policy is authenticated-only → anon gets empty (no rows leak)
const committeesAnon = await anon.from("committees").select("id");
check("committees hidden from anon", (committeesAnon.data?.length ?? -1) === 0, `${committeesAnon.data?.length} rows`);

// --- storage buckets exist (public read policies) ---
const avatars = await anon.storage.from("avatars").list();
check("avatars bucket exists", !avatars.error, avatars.error ? String(avatars.error.message).slice(0, 100) : "listed (empty ok)");
const clubMedia = await anon.storage.from("club-media").list();
check("club-media bucket exists", !clubMedia.error, clubMedia.error ? String(clubMedia.error.message).slice(0, 100) : "listed (empty ok)");

// --- signup flow: email confirmation OFF + profile trigger ---
const testEmail = `dtc.verify.${Date.now()}@example.com`;
const testPassword = "DtcVerify-2026!";
let testClient = null;
let session = null;
try {
  testClient = createClient(url, key);
  const signUpRes = await testClient.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: { data: { full_name: "Test Vérification" } },
  });
  session = signUpRes.data.session ?? null;
  check(
    "signup returns session (email confirmation OFF)",
    Boolean(session),
    session ? "session OK" : `no session — confirmation likely ON (identities: ${signUpRes.data.user?.identities?.length})`
  );
} catch (err) {
  check("signup", false, String(err.message).slice(0, 120));
}

if (session && testClient) {
  const mine = await testClient.rpc("my_profile");
  const profile = (mine.data ?? [])[0];
  check(
    "profile auto-created by trigger (my_profile)",
    Boolean(profile?.id) && profile?.role === "member" && profile?.email === testEmail,
    profile ? `role=${profile.role} email=${profile.email}` : String(mine.error?.message).slice(0, 100)
  );

  const safeRead = await testClient.from("profiles").select("id, full_name");
  check("member reads profiles safe columns", !safeRead.error && (safeRead.data?.length ?? 0) >= 1, `${safeRead.data?.length} rows`);

  const emailRead = await testClient.from("profiles").select("email");
  check(
    "member CANNOT read profiles.email (column grant)",
    Boolean(emailRead.error),
    emailRead.error ? String(emailRead.error.message).slice(0, 100) : "!! email column leaked to member"
  );

  const dir = await testClient.rpc("member_directory");
  check(
    "member_directory() works for member",
    !dir.error && Array.isArray(dir.data),
    dir.error ? String(dir.error.message).slice(0, 100) : `${dir.data.length} entries`
  );

  const escalate = await testClient.rpc("admin_set_role", { target_id: "00000000-0000-0000-0000-000000000000", new_role: "admin" });
  check(
    "member cannot escalate via admin_set_role",
    Boolean(escalate.error),
    escalate.error ? String(escalate.error.message).slice(0, 100) : "!! escalation allowed"
  );

  // idea insert path (the fixed author_id flow) — insert then it stays as a visible test idea; report for cleanup
  const idea = await testClient
    .from("ideas")
    .insert({ title: "[TEST] vérification automatique — à supprimer", description: "Idea créée par le script de vérification.", author_id: profile?.id })
    .select("id");
  check("idea insert works (author_id path)", !idea.error, idea.error ? String(idea.error.message).slice(0, 100) : `id=${idea.data?.[0]?.id?.slice(0, 8)}…`);

  await testClient.auth.signOut();
}

console.log(`\nsupabase project: ${url.replace(/^https:\/\/([a-z0-9]+).*$/, "$1…")}`);
console.log(`test account: ${testEmail}\n`);
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
}
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
