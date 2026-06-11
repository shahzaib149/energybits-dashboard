/**
 * sync-ad-links.mjs
 *
 * Reads ad_link from the `ad_preview` table and writes it into every
 * matching record in `facebook_ads_insights` (matched by ad_id).
 *
 * Usage:
 *   node scripts/sync-ad-links.mjs
 *
 * Requires AIRTABLE_API_KEY in .env.local
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── Load .env.local ─────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const API_KEY = process.env.AIRTABLE_API_KEY;
if (!API_KEY) {
  console.error("❌  AIRTABLE_API_KEY not found in .env.local");
  process.exit(1);
}

const BASE_ID = "appT4Zh37Im2Ks4Lh";
const ROOT    = "https://api.airtable.com/v0";
const HEADERS = { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" };

// Airtable rate-limit: max 5 req/s — we batch PATCHes at 10 records each, with a small delay.
const PATCH_BATCH   = 10;
const PATCH_DELAY_MS = 250; // ~4 batches/s to stay under limit

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllPages(table) {
  const records = [];
  let offset = undefined;
  do {
    const url = new URL(`${ROOT}/${BASE_ID}/${encodeURIComponent(table)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), { headers: HEADERS });
    if (!res.ok) throw new Error(`GET ${table} → ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
    if (offset) await sleep(200);
  } while (offset);
  return records;
}

async function patchBatch(table, updates) {
  // updates = [{ id, fields }]  max 10 per request
  const res = await fetch(`${ROOT}/${BASE_ID}/${encodeURIComponent(table)}`, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ records: updates })
  });
  if (!res.ok) throw new Error(`PATCH ${table} → ${res.status}: ${await res.text()}`);
  return await res.json();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log("📥  Fetching ad_preview …");
const previewRecords = await fetchAllPages("ad_preview");

// Build map: ad_id → ad_link
const previewMap = new Map();
for (const r of previewRecords) {
  const id   = String(r.fields.ad_id  ?? "").trim();
  const link = String(r.fields.ad_link ?? "").trim();
  if (id && link) previewMap.set(id, link);
}
console.log(`   Found ${previewMap.size} ad_id → ad_link mappings in ad_preview`);

console.log("📥  Fetching facebook_ads_insights …");
const insightRecords = await fetchAllPages("facebook_ads_insights");
console.log(`   Found ${insightRecords.length} records in facebook_ads_insights`);

// Match and build update list
const updates = [];
let skipped = 0;

for (const r of insightRecords) {
  // Field has typo: "add id" (double-d)
  const adId = String(r.fields["add id"] ?? r.fields["ad_id"] ?? r.fields["ad id"] ?? "").trim();
  if (!adId) { skipped++; continue; }

  const newLink = previewMap.get(adId);
  if (!newLink) { skipped++; continue; }

  updates.push({ id: r.id, fields: { "add link": newLink } });
}

console.log(`\n🔗  ${updates.length} records will be updated (${skipped} skipped — no match)`);

if (updates.length === 0) {
  console.log("✅  Nothing to update.");
  process.exit(0);
}

// Patch in batches of 10
let done = 0;
for (let i = 0; i < updates.length; i += PATCH_BATCH) {
  const batch = updates.slice(i, i + PATCH_BATCH);
  await patchBatch("facebook_ads_insights", batch);
  done += batch.length;
  process.stdout.write(`\r   Updated ${done} / ${updates.length} …`);
  if (i + PATCH_BATCH < updates.length) await sleep(PATCH_DELAY_MS);
}

console.log(`\n✅  Done — ${done} records updated.`);
