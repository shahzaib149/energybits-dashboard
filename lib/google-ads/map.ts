import type {
  AirtableRecordRaw,
  GoogleAdsAdGroupRow,
  GoogleAdsCampaignRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow
} from "@/lib/google-ads/types";

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

/** Campaign/ad group/creative tables store CTR as decimal (0.29 = 29%). */
function decimalRate(value: unknown): { rate: number; ratePct: number } {
  const raw = asNumber(value);
  if (raw > 1) return { rate: raw / 100, ratePct: raw };
  return { rate: raw, ratePct: raw * 100 };
}

/** Keyword table stores CTR and conversion rate as percent (46.34 = 46.34%). */
function percentRate(value: unknown): { rate: number; ratePct: number } {
  const raw = asNumber(value);
  if (raw <= 1 && raw > 0) return { rate: raw, ratePct: raw * 100 };
  return { rate: raw / 100, ratePct: raw };
}

export function mapCampaignRecord(record: AirtableRecordRaw): GoogleAdsCampaignRow {
  const f = record.fields;
  const ctr = decimalRate(f.CTR);
  const convRate = decimalRate(f["Conversion Rate"]);

  return {
    id: record.id,
    uniqueKey: asString(f["Unique Key"]),
    date: asString(f.Date),
    platform: asString(f.Platform),
    accountId: asString(f["Account ID"]),
    accountName: asString(f["Account Name"]),
    campaignId: asString(f["Campaign ID"]),
    campaignName: asString(f["Campaign Name"]),
    campaignStatus: asString(f["Campaign Status"]),
    channelType: asString(f["Channel Type"]),
    biddingStrategy: asString(f["Bidding Strategy"]),
    optimizationScore: asNumber(f["Optimization Score"]),
    impressions: asNumber(f.Impressions),
    clicks: asNumber(f.Clicks),
    cost: asNumber(f.Cost),
    ctr: ctr.rate,
    ctrPct: ctr.ratePct,
    averageCpc: asNumber(f["Average CPC"]),
    conversions: asNumber(f.Conversions),
    conversionValue: asNumber(f["Conversion Value"]),
    costPerConversion: asNumber(f["Cost Per Conversion"]),
    conversionRate: convRate.rate,
    conversionRatePct: convRate.ratePct,
    searchImpressionShare: asNumber(f["Search Impression Share"]),
    budgetLostImpressionShare: asNumber(f["Budget Lost Impression Share"]),
    rankLostImpressionShare: asNumber(f["Rank Lost Impression Share"]),
    roas: asNumber(f.ROAS),
    pulledAt: asString(f["Pulled At"])
  };
}

export function mapAdGroupRecord(record: AirtableRecordRaw): GoogleAdsAdGroupRow {
  const f = record.fields;
  const ctr = decimalRate(f.CTR);
  const convRate = decimalRate(f["Conversion Rate"]);

  return {
    id: record.id,
    uniqueKey: asString(f["Unique Key"]),
    date: asString(f.Date),
    platform: asString(f.Platform),
    accountId: asString(f["Account ID"]),
    accountName: asString(f["Account Name"]),
    campaignId: asString(f["Campaign ID"]),
    campaignName: asString(f["Campaign Name"]),
    adGroupId: asString(f["Ad Group ID"]),
    adGroupName: asString(f["Ad Group Name"]),
    adGroupStatus: asString(f["Ad Group Status"]),
    impressions: asNumber(f.Impressions),
    clicks: asNumber(f.Clicks),
    cost: asNumber(f.Cost),
    ctr: ctr.rate,
    ctrPct: ctr.ratePct,
    averageCpc: asNumber(f["Average CPC"]),
    conversions: asNumber(f.Conversions),
    conversionValue: asNumber(f["Conversion Value"]),
    costPerConversion: asNumber(f["Cost Per Conversion"]),
    conversionRate: convRate.rate,
    conversionRatePct: convRate.ratePct,
    roas: asNumber(f.ROAS),
    pulledAt: asString(f["Pulled At"])
  };
}

export function mapCreativeRecord(record: AirtableRecordRaw): GoogleAdsCreativeRow {
  const f = record.fields;
  const ctr = decimalRate(f.CTR);
  const convRate = decimalRate(f["Conversion Rate"]);

  return {
    id: record.id,
    uniqueKey: asString(f["Unique Key"]),
    date: asString(f.Date),
    platform: asString(f.Platform),
    accountId: asString(f["Account ID"]),
    accountName: asString(f["Account Name"]),
    campaignId: asString(f["Campaign ID"]),
    campaignName: asString(f["Campaign Name"]),
    adGroupId: asString(f["Ad Group ID"]),
    adGroupName: asString(f["Ad Group Name"]),
    adId: asString(f["Ad ID"]),
    adName: asString(f["Ad Name"]),
    adStatus: asString(f["Ad Status"]),
    adType: asString(f["Ad Type"]),
    impressions: asNumber(f.Impressions),
    clicks: asNumber(f.Clicks),
    cost: asNumber(f.Cost),
    ctr: ctr.rate,
    ctrPct: ctr.ratePct,
    averageCpc: asNumber(f["Average CPC"]),
    conversions: asNumber(f.Conversions),
    conversionValue: asNumber(f["Conversion Value"]),
    costPerConversion: asNumber(f["Cost Per Conversion"]),
    conversionRate: convRate.rate,
    conversionRatePct: convRate.ratePct,
    roas: asNumber(f.ROAS),
    pulledAt: asString(f["Pulled At"]),
    creativeTagSuggestions: asString(f["Creative Tag Suggestions"])
  };
}

export function mapKeywordRecord(record: AirtableRecordRaw): GoogleAdsKeywordRow {
  const f = record.fields;
  const ctr = percentRate(f.CTR);
  const convRate = percentRate(f["Conversion Rate"]);

  return {
    id: record.id,
    uniqueKey: asString(f["Unique Key"]),
    date: asString(f.Date),
    platform: asString(f.Platform),
    accountId: asString(f["Account ID"]),
    accountName: asString(f["Account Name"]),
    campaignId: asString(f["Campaign ID"]),
    campaignName: asString(f["Campaign Name"]),
    adGroupId: asString(f["Ad Group ID"]),
    adGroupName: asString(f["Ad Group Name"]),
    keywordId: asString(f["Keyword ID"]),
    keywordText: asString(f["Keyword Text"]),
    matchType: asString(f["Match Type"]),
    keywordStatus: asString(f["Keyword Status"]),
    impressions: asNumber(f.Impressions),
    clicks: asNumber(f.Clicks),
    cost: asNumber(f.Cost),
    ctr: ctr.rate,
    ctrPct: ctr.ratePct,
    averageCpc: asNumber(f["Average CPC"]),
    conversions: asNumber(f.Conversions),
    conversionValue: asNumber(f["Conversion Value"]),
    costPerConversion: asNumber(f["Cost Per Conversion"]),
    conversionRate: convRate.rate,
    conversionRatePct: convRate.ratePct,
    roas: asNumber(f.ROAS),
    pulledAt: asString(f["Pulled At"])
  };
}
