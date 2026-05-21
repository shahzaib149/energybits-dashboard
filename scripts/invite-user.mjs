/**
 * Invite one dashboard user (magic link + profile).
 * Usage: node scripts/invite-user.mjs <email> <fullName> <role>
 * Example: node scripts/invite-user.mjs shahzaibhamid02@gmail.com "Shahzaib Hamid" admin
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

if (!email) {
  console.error('Usage: node scripts/invite-user.mjs <email> <fullName> <role>');
  process.exit(1);
}

if (!["admin", "editor", "viewer"].includes(role)) {
  console.error("Role must be admin, editor, or viewer");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "http://localhost:3000";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: listData } = await supabase.auth.admin.listUsers();
const existing = listData?.users.find((u) => u.email?.toLowerCase() === email);

let userId = existing?.id;

if (!existing) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm`
  });
  if (error) {
    console.error("Invite failed:", error.message);
    process.exit(1);
  }
  userId = data.user?.id;
  console.log(`Invite email sent to ${email}. Open the link to set your password.`);
} else {
  console.log(`User already exists: ${email}`);
  if (existing.banned_until) {
    const { error: unbanError } = await supabase.auth.admin.updateUserById(existing.id, {
      ban_duration: "none"
    });
    if (unbanError) console.warn("Could not clear ban:", unbanError.message);
  }
}

if (userId) {
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName || null,
      role,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
  if (profileError) {
    console.error("Profile upsert failed:", profileError.message);
    console.error("Have you run migration 003 in Supabase SQL Editor?");
    process.exit(1);
  }
  console.log(`Profile ready: ${email} → ${role}`);
}

console.log("Done.");
