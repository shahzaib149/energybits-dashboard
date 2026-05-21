/**
 * One-time: invite real ENERGYbits dashboard users via Supabase magic link.
 * Run: node scripts/invite-users.mjs
 *
 * Set emails in INVITE_USERS below before running.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
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

/** Fill in all emails before running. Script exits if any are empty. */
const INVITE_USERS = [
  { email: process.env.INVITE_SHAHZAIB_EMAIL ?? "shahzaibhamid02@gmail.com", fullName: "Shahzaib Hamid", role: "admin" },
  { email: process.env.INVITE_CATHARINE_EMAIL ?? "", fullName: "Catharine Arnston", role: "editor" },
  { email: process.env.INVITE_BRANDON_EMAIL ?? "", fullName: "Brandon", role: "editor" }
];

const missing = INVITE_USERS.filter((u) => !u.email.trim());
if (missing.length > 0) {
  console.error(
    "Missing invite emails. Set INVITE_CATHARINE_EMAIL and INVITE_BRANDON_EMAIL in .env.local, or edit scripts/invite-users.mjs"
  );
  console.error("Users without email:", missing.map((u) => u.fullName).join(", "));
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "http://localhost:3000";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

for (const invite of INVITE_USERS) {
  const email = invite.email.trim().toLowerCase();

  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData?.users.find((u) => u.email?.toLowerCase() === email);

  let userId = existing?.id;

  if (!existing) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback`
    });
    if (error) {
      console.error(`Invite failed for ${email}:`, error.message);
      continue;
    }
    userId = data.user?.id;
    console.log(`Invited: ${email}`);
  } else {
    console.log(`User already exists: ${email}`);
  }

  if (userId) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: invite.fullName,
        role: invite.role,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );
    if (profileError) {
      console.error(`Profile upsert failed for ${email}:`, profileError.message);
    } else {
      console.log(`Profile set: ${email} → ${invite.role}`);
    }
  }
}

console.log("Invite script complete.");
