import type { AirtableRecordRaw, CriteoDailyRow, CriteoOverallRow } from "@/lib/criteo-ads/types";

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function percentRate(value: unknown): number {
  const raw = asNumber(value);
  if (raw <= 1 && raw > 0) return raw * 100;
  return raw;
}

export function mapDailyRecord(record: AirtableRecordRaw): CriteoDailyRow {
  const f = record.fields;

  return {
    id: record.id,
    campaignId: asString(f.CampaignId),
    campaignName: asString(f.CampaignName),
    adsetId: asString(f.AdsetId),
    adsetBits: asString(f.AdsetBits),
    adId: asString(f.AdId),
    ad: asString(f.Ad),
    day: asString(f.Day),
    currency: asString(f.Currency),
    clicks: asNumber(f.Clicks),
    displays: asNumber(f.Displays),
    advertiserCost: asNumber(f.AdvertiserCost),
    salesAllClientAttribution: asNumber(f.SalesAllClientAttribution),
    revenueGeneratedAllClientAttribution: asNumber(f.RevenueGeneratedAllClientAttribution),
    roasAllClientAttribution: asNumber(f.RoasAllClientAttribution),
    frequency: asNumber(f.Frequency),
    cpc: asNumber(f.Cpc),
    eCpm: asNumber(f.ECpm),
    ctrPct: percentRate(f["CTR (calculated)"])
  };
}

export function mapOverallRecord(record: AirtableRecordRaw): CriteoOverallRow {
  const f = record.fields;

  return {
    id: record.id,
    clicks: asNumber(f.Clicks),
    displays: asNumber(f.Displays),
    advertiserCost: asNumber(f.AdvertiserCost),
    salesAllClientAttribution: asNumber(f.SalesAllClientAttribution),
    revenueGeneratedAllClientAttribution: asNumber(f.RevenueGeneratedAllClientAttribution),
    roasAllClientAttribution: asNumber(f.RoasAllClientAttribution),
    reach: asNumber(f.Reach),
    frequency: asNumber(f.Frequency),
    clickThroughRate: percentRate(f.ClickThroughRate),
    cpc: asNumber(f.Cpc),
    eCpm: asNumber(f.ECpm)
  };
}
