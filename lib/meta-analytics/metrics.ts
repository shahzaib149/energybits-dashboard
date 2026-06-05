import type {
  MetaAdInsightRow,
  MetaAggregatedRow,
  MetaCampaignRow,
  MetaDailyTrendRow
} from "@/lib/meta-analytics/types";

type SumBucket = {
  clicks: number;
  impressions: number;
  reach: number;
  spend: number;
  recordCount: number;
};

function emptyBucket(): SumBucket {
  return { clicks: 0, impressions: 0, reach: 0, spend: 0, recordCount: 0 };
}

function computeCtrPct(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return (clicks / impressions) * 100;
}

function computeCpc(spend: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return spend / clicks;
}

function computeCpm(spend: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return (spend / impressions) * 1000;
}

function toAggregated(id: string, label: string, bucket: SumBucket): MetaAggregatedRow {
  return {
    id,
    label,
    clicks: bucket.clicks,
    impressions: bucket.impressions,
    reach: bucket.reach,
    spend: bucket.spend,
    ctrPct: computeCtrPct(bucket.clicks, bucket.impressions),
    cpc: computeCpc(bucket.spend, bucket.clicks),
    cpm: computeCpm(bucket.spend, bucket.impressions),
    frequency: bucket.impressions > 0 && bucket.reach > 0 ? bucket.impressions / bucket.reach : 0,
    recordCount: bucket.recordCount
  };
}

export function sumSpend(rows: Array<{ spend: number }>): number {
  return rows.reduce((sum, row) => sum + row.spend, 0);
}

export function sumClicks(rows: Array<{ clicks: number }>): number {
  return rows.reduce((sum, row) => sum + row.clicks, 0);
}

export function sumImpressions(rows: Array<{ impressions: number }>): number {
  return rows.reduce((sum, row) => sum + row.impressions, 0);
}

export function sumReach(rows: Array<{ reach: number }>): number {
  return rows.reduce((sum, row) => sum + row.reach, 0);
}

export function weightedCtrPct(rows: MetaCampaignRow[]): number {
  const clicks = sumClicks(rows);
  const impressions = sumImpressions(rows);
  return computeCtrPct(clicks, impressions);
}

export function weightedCpc(rows: MetaCampaignRow[]): number {
  return computeCpc(sumSpend(rows), sumClicks(rows));
}

export function weightedCpm(rows: MetaCampaignRow[]): number {
  return computeCpm(sumSpend(rows), sumImpressions(rows));
}

/**
 * Removes duplicate campaign rows where the same campaignId + dateStart appears more than once.
 * Make.com occasionally syncs the same day's data multiple times, producing duplicate Airtable
 * records that inflate every metric. Always call this before aggregating or summing.
 */
export function deduplicateCampaignRows(rows: MetaCampaignRow[]): MetaCampaignRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.campaignId || row.campaignName}__${row.dateStart}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function uniqueCampaignCount(rows: MetaCampaignRow[]): number {
  return new Set(rows.map((row) => row.campaignId).filter(Boolean)).size;
}

export function uniqueAdCount(rows: MetaAdInsightRow[]): number {
  return new Set(rows.map((row) => row.adId).filter(Boolean)).size;
}

export function latestDay(rows: Array<{ dateStart: string }>): string | null {
  const days = rows.map((row) => row.dateStart).filter(Boolean);
  return days.length ? days.sort((a, b) => b.localeCompare(a))[0] : null;
}

export function aggregateCampaignsById(rows: MetaCampaignRow[]): MetaAggregatedRow[] {
  const map = new Map<string, SumBucket & { label: string }>();

  for (const row of rows) {
    const key = row.campaignId || row.campaignName || row.id;
    const existing = map.get(key) ?? { ...emptyBucket(), label: row.campaignName || key };
    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    existing.reach += row.reach;
    existing.spend += row.spend;
    existing.recordCount += 1;
    if (row.campaignName) existing.label = row.campaignName;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([id, bucket]) => toAggregated(id, bucket.label, bucket))
    .sort((a, b) => b.spend - a.spend);
}

export function aggregateAdsById(rows: MetaAdInsightRow[]): MetaAggregatedRow[] {
  const map = new Map<string, SumBucket & { label: string }>();

  for (const row of rows) {
    const key = row.adId || row.adName || row.id;
    const existing = map.get(key) ?? { ...emptyBucket(), label: row.adName || key };
    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    existing.reach += row.reach;
    existing.spend += row.spend;
    existing.recordCount += 1;
    if (row.adName) existing.label = row.adName;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([id, bucket]) => toAggregated(id, bucket.label, bucket))
    .sort((a, b) => b.spend - a.spend);
}

/** Groups daily ad-insight records by date — use this for accurate period trend charts. */
export function aggregateAdsByDay(rows: MetaAdInsightRow[]): MetaDailyTrendRow[] {
  const map = new Map<string, SumBucket>();

  for (const row of rows) {
    const day = row.dateStart || "Unknown";
    const existing = map.get(day) ?? emptyBucket();
    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    existing.reach += row.reach;
    existing.spend += row.spend;
    existing.recordCount += 1;
    map.set(day, existing);
  }

  return Array.from(map.entries())
    .map(([day, bucket]) => ({
      day,
      spend: bucket.spend,
      clicks: bucket.clicks,
      impressions: bucket.impressions,
      reach: bucket.reach
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function aggregateCampaignsByDay(rows: MetaCampaignRow[]): MetaDailyTrendRow[] {
  const map = new Map<string, SumBucket>();

  for (const row of rows) {
    const day = row.dateStart || "Unknown";
    const existing = map.get(day) ?? emptyBucket();
    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    existing.reach += row.reach;
    existing.spend += row.spend;
    existing.recordCount += 1;
    map.set(day, existing);
  }

  return Array.from(map.entries())
    .map(([day, bucket]) => ({
      day,
      spend: bucket.spend,
      clicks: bucket.clicks,
      impressions: bucket.impressions,
      reach: bucket.reach
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function campaignColor(index: number): string {
  const colors = ["#0081FB", "#1877F2", "#0064E0", "#4599FF", "#54C7EC", "#1B74E4", "#4267B2", "#5B9BD5"];
  return colors[index % colors.length];
}

export function buildSpendBreakdown(rows: MetaAggregatedRow[]) {
  const total = rows.reduce((sum, row) => sum + row.spend, 0) || 1;
  return rows.map((row, index) => ({
    name: row.label,
    value: row.spend,
    pct: (row.spend / total) * 100,
    color: campaignColor(index)
  }));
}
