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

  return {
    id: record.id,
    accountId: asString(f.account_id),
    accountName: asString(f.account_name),
    adId: asString(f["ad_id"] ?? f["ad id"] ?? f["add id"]),
    adName: asString(f["ad_name"] ?? f["ad name"] ?? f["add name"]),
    adLink: asString(f["ad_link"] ?? f["ad link"] ?? f["add link"]),
    clicks: asNumber(f.clicks),
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
    impressions: asNumber(f.impressions),
    reach: asNumber(f.reach),
    socialSpend: asNumber(f.social_spend),
    spend: asNumber(f.spend),
    purchaseRoas: asString(f.purchase_roas),
    websitePurchaseRoas: asString(f.website_purchase_roas),
    actions: asString(f.actions)
  };
}
