/**
 * Upsert admin profile for an invited user (after grants SQL is applied).
 * Usage: node scripts/upsert-profile.mjs <email> <fullName> <role>
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const [emailArg, fullNameArg, roleArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
const fullName = fullNameArg?.trim() ?? "";
const role = roleArg?.trim() ?? "admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!email || !url || !serviceKey) {
  console.error("Usage: node scripts/upsert-profile.mjs <email> <fullName> <role>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("List users failed:", listError.message);
  process.exit(1);
}

const user = listData.users.find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error(`No auth user found for ${email}. Run invite-user script first.`);
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").upsert(
  {
    id: user.id,
    email,
    full_name: fullName || null,
    role,
    updated_at: new Date().toISOString()
  },
  { onConflict: "id" }
);

if (profileError) {
  console.error("Profile upsert failed:", profileError.message);
  console.error("Run supabase/migrations/001_grants.sql in SQL Editor, then retry.");
  process.exit(1);
}

console.log(`Profile ready: ${email} → ${role} (user id ${user.id})`);
