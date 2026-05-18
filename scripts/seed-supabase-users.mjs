/**
 * One-time: create admin + user + profiles.role
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Run: npm run seed:auth
 * Or:  start dev server and open http://localhost:3000/api/auth/seed
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("\nMissing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("Get it: Supabase → Project Settings → API → service_role (secret)\n");
  process.exit(1);
}

const USERS = [
  { email: "admin@gmail.com", password: "energybits123", role: "admin" },
  { email: "user@gmail.com", password: "energybits321", role: "user" }
];

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

for (const account of USERS) {
  const email = account.email.toLowerCase();
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email?.toLowerCase() === email);
  let userId = found?.id;

  if (found) {
    const { error } = await supabase.auth.admin.updateUserById(found.id, {
      password: account.password,
      email_confirm: true
    });
    if (error) {
      console.error(`Update failed for ${email}:`, error.message);
      continue;
    }
    console.log(`Updated ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: account.password,
      email_confirm: true
    });
    if (error) {
      console.error(`Create failed for ${email}:`, error.message);
      continue;
    }
    userId = data.user?.id;
    console.log(`Created ${email}`);
  }

  if (userId) {
    const { error } = await supabase.from("profiles").upsert(
      { id: userId, email, role: account.role },
      { onConflict: "id" }
    );
    if (error) console.error(`Profile upsert for ${email}:`, error.message);
    else console.log(`  → role: ${account.role}`);
  }
}

console.log("\nDone. Refresh profiles table in Supabase, then sign in at /login\n");
