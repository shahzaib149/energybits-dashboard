/**
 * One-time: disable legacy test accounts (admin@gmail.com, user@gmail.com).
 * Run: node scripts/disable-test-users.mjs
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

const TEST_EMAILS = ["admin@gmail.com", "user@gmail.com"];
const BAN_DURATION = "876600h"; // ~100 years

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

for (const email of TEST_EMAILS) {
  const user = listData.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    console.log(`Skip ${email} — not found`);
    continue;
  }
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    ban_duration: BAN_DURATION
  });
  if (error) {
    console.error(`Failed to ban ${email}:`, error.message);
  } else {
    console.log(`Banned test account: ${email}`);
  }
}

console.log("Done.");
