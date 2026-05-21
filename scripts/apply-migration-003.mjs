/**
 * Apply migration 003 via Postgres (requires SUPABASE_DB_URL in .env.local).
 * Get URI from Supabase → Project Settings → Database → Connection string (URI).
 *
 * Run: node scripts/apply-migration-003.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

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

const dbUrl = process.env.SUPABASE_DB_URL?.trim();
if (!dbUrl) {
  console.error(
    "Add SUPABASE_DB_URL to .env.local (Supabase → Settings → Database → Connection string URI), then re-run."
  );
  process.exit(1);
}

const sqlPath = resolve(process.cwd(), "supabase/migrations/003_profiles_roles_audit_log.sql");
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("Migration 003 applied successfully.");
} catch (err) {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
