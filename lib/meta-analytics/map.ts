import type { AirtableRecordRaw, MetaAdInsightRow, MetaCampaignRow } from "@/lib/meta-analytics/types";

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace(/[$,%\s,]/g, "").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** Parse Meta's actions/action_values JSON string to extract a specific action type's numeric value.
 *  Airtable stores this as comma-separated objects WITHOUT surrounding brackets, e.g.:
 *    {"action_type":"purchase","value":"2"}, {"action_type":"link_click","value":"96"}
 *  We wrap it in [] to make it valid JSON before parsing. */
function parseActionValue(raw: string, ...types: string[]): number {
  if (!raw) return 0;
  try {
    // Wrap in array brackets if not already an array
    const normalized = raw.trim().startsWith("[") ? raw : `[${raw}]`;
    const parsed = JSON.parse(normalized) as Array<{ action_type: string; value: string }>;
    if (!Array.isArray(parsed)) return 0;
    for (const t of types) {
      const match = parsed.find((a) => a.action_type === t);
      if (match) return asNumber(match.value);
    }
  } catch { /* not valid JSON */ }
  return 0;
}

/** Parse purchase ROAS — may be a plain number, a JSON array, or a single JSON object. */
function parseRoasString(raw: string): number {
  if (!raw) return 0;
  const direct = asNumber(raw);
  if (direct > 0) return direct;
  try {
    // Wrap in array brackets if not already an array (same Airtable format issue)
    const normalized = raw.trim().startsWith("[") ? raw : `[${raw}]`;
    const parsed = JSON.parse(normalized) as Array<{ value: string }>;
    if (Array.isArray(parsed) && parsed[0]?.value) return asNumber(parsed[0].value);
  } catch { /* not valid JSON */ }
  return 0;
}

function asDate(value: unknown): string {
  const raw = asString(value);
  return raw ? raw.slice(0, 10) : "";
}

/** Normalize percent fields that may be stored as 2.26 or 0.0226. */
function asPercent(value: unknown): { raw: number; pct: number } {
  const n = asNumber(value);
  if (n <= 0) return { raw: 0, pct: 0 };
  if (n <= 1) return { raw: n, pct: n * 100 };
  return { raw: n / 100, pct: n };
}

export function mapMetaCampaignRecord(record: AirtableRecordRaw): MetaCampaignRow {
  const f = record.fields;
  const ctr = asPercent(f.CTR);

  return {
    id: record.id,
    campaignId: asString(f["Campaign ID"]),
    campaignName: asString(f["Campaign Name"]),
    clicks: asNumber(f.Clicks),
    costPerUniqueClick: asNumber(f["Cost Per Unique Click"]),
    cpc: asNumber(f.CPC),
    cpm: asNumber(f.CPM),
    ctr: ctr.raw,
    ctrPct: ctr.pct,
    frequency: asNumber(f.Frequency),
    impressions: asNumber(f.Impressions),
    reach: asNumber(f.Reach),
    spend: asNumber(f.Spend),
    dateStart: asDate(f["Date Start"]),
    dateStop: asDate(f["Date Stop"])
  };
}

export function mapMetaAdInsightRecord(record: AirtableRecordRaw): MetaAdInsightRow {
  const f = record.fields;
  const ctr = asPercent(f.ctr);

  const actionsStr      = asString(f.actions);
  const actionValuesStr = asString(f.action_values ?? f["action values"] ?? "");
  const purchaseRoasStr = asString(f.purchase_roas);

  // Conversion counts from actions JSON
  const purchases = parseActionValue(actionsStr,
    "purchase", "omni_purchase", "offsite_conversion.fb_pixel_purchase");
  const formLeads = parseActionValue(actionsStr,
    "lead", "offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped");

  // Purchase value from action_values JSON (monetary)
  const purchaseValue = parseActionValue(actionValuesStr,
    "purchase", "omni_purchase", "offsite_conversion.fb_pixel_purchase");

  const impressions = asNumber(f.impressions);
  const spend       = asNumber(f.spend);
  const roasRaw     = parseRoasString(purchaseRoasStr);

  // If action_values is missing (common — Airtable often doesn't sync it),
  // derive purchaseValue from ROAS × spend so revenue/ROAS are still accurate.
  const purchaseValueFinal = purchaseValue > 0
    ? purchaseValue
    : (roasRaw > 0 && spend > 0 ? roasRaw * spend : 0);

  const roas = roasRaw > 0 ? roasRaw
    : (purchaseValueFinal > 0 && spend > 0 ? purchaseValueFinal / spend : 0);

  // Video funnel metrics (may not exist in all Airtable tables)
  const video3SecViews = parseActionValue(
    asString(f.video_p3_watched_actions ?? f["video_p3_watched_actions"] ?? "")
  ) || asNumber(f.video_3_sec_impressions ?? f["video_3_sec_impressions"] ?? 0);
  const thruPlays = parseActionValue(
    asString(f.video_thruplay_watched_actions ?? f["video_thruplay_watched_actions"] ?? "")
  ) || asNumber(f.video_thruplay_watched ?? 0);

  const hookRate     = impressions > 0 && video3SecViews > 0 ? (video3SecViews / impressions) * 100 : 0;
  const thruPlayRate = impressions > 0 && thruPlays > 0      ? (thruPlays / impressions) * 100      : 0;

  return {
    id: record.id,
    accountId: asString(f.account_id),
    accountName: asString(f.account_name),
    adId: asString(f["ad_id"] ?? f["ad id"] ?? f["add id"]),
    adName: asString(f["ad_name"] ?? f["ad name"] ?? f["add name"]),
    adLink: asString(f["ad_link"] ?? f["ad link"] ?? f["add link"]),
    clicks: asNumber(f.clicks),
    qualityRanking: asString(f.quality_ranking),
    engagementRateRanking: asString(f.engagement_rate_ranking),
    conversionRateRanking: asString(f.conversion_rate_ranking),
    cpc: asNumber(f.cpc),
    cpm: asNumber(f.cpm),
    cpp: asNumber(f.cpp),
    ctr: ctr.raw,
    ctrPct: ctr.pct,
    dateStart: asDate(f.date_start),
    dateStop: asDate(f.date_stop),
    frequency: asNumber(f.frequency),
    fullViewImpressions: asNumber(f.full_view_impressions),
    fullViewReach: asNumber(f.full_view_reach),
    impressions,
    reach: asNumber(f.reach),
    socialSpend: asNumber(f.social_spend),
    spend,
    purchaseRoas: purchaseRoasStr,
    websitePurchaseRoas: asString(f.website_purchase_roas),
    actions: actionsStr,
    purchases,
    purchaseValue: purchaseValueFinal,
    roas,
    formLeads,
    video3SecViews,
    thruPlays,
    hookRate,
    thruPlayRate
  };
}
