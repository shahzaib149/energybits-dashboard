import type {
  AggregatedMetricRow,
  BreakdownRow,
  GoogleAdsAdGroupRow,
  GoogleAdsCampaignRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow
} from "@/lib/google-ads/types";

type MetricRow = {
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
};

function computeRoas(conversionValue: number, cost: number): number {
  if (cost <= 0) return 0;
  return conversionValue / cost;
}

function computeCtrPct(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return (clicks / impressions) * 100;
}

export function sumCost(rows: Array<{ cost: number }>): number {
  return rows.reduce((sum, row) => sum + row.cost, 0);
}

export function sumClicks(rows: Array<{ clicks: number }>): number {
  return rows.reduce((sum, row) => sum + row.clicks, 0);
}

export function sumConversions(rows: Array<{ conversions: number }>): number {
  return rows.reduce((sum, row) => sum + row.conversions, 0);
}

export function sumConversionValue(rows: Array<{ conversionValue: number }>): number {
  return rows.reduce((sum, row) => sum + row.conversionValue, 0);
}

export function overallRoas(rows: MetricRow[]): number {
  const cost = sumCost(rows);
  const value = sumConversionValue(rows);
  return computeRoas(value, cost);
}

export function latestPulledAt(rows: Array<{ pulledAt: string; date: string }>): string | null {
  const dates = rows.map((r) => r.pulledAt || r.date).filter(Boolean);
  if (dates.length === 0) return null;
  return dates.sort((a, b) => b.localeCompare(a))[0];
}

export function aggregateByField<T extends MetricRow & { ctrPct?: number }>(
  rows: T[],
  field: keyof T
): AggregatedMetricRow[] {
  const map = new Map<string, MetricRow>();

  for (const row of rows) {
    const label = String(row[field] || "Unknown");
    const existing = map.get(label) ?? {
      cost: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
      conversionValue: 0
    };
    existing.cost += row.cost;
    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    existing.conversions += row.conversions;
    existing.conversionValue += row.conversionValue;
    map.set(label, existing);
  }

  return Array.from(map.entries())
    .map(([label, metrics]) => ({
      label,
      ...metrics,
      roas: computeRoas(metrics.conversionValue, metrics.cost),
      ctrPct: computeCtrPct(metrics.clicks, metrics.impressions)
    }))
    .sort((a, b) => b.cost - a.cost);
}

export function buildCostBreakdown<T extends { cost: number }>(
  rows: T[],
  field: keyof T
): BreakdownRow[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const name = String(row[field] || "Other");
    map.set(name, (map.get(name) ?? 0) + row.cost);
  }
  const total = Array.from(map.values()).reduce((sum, n) => sum + n, 0) || 1;
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value, pct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export function buildCountBreakdown<T>(rows: T[], field: keyof T): BreakdownRow[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const name = String(row[field] || "Other");
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value, pct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export function avgImpressionShare(campaigns: GoogleAdsCampaignRow[]) {
  const search = campaigns.filter((c) => c.channelType === "SEARCH" && c.searchImpressionShare > 0);
  if (search.length === 0) {
    return { searchShare: 0, budgetLost: 0, rankLost: 0 };
  }
  const count = search.length;
  return {
    searchShare: search.reduce((s, c) => s + c.searchImpressionShare, 0) / count,
    budgetLost: search.reduce((s, c) => s + c.budgetLostImpressionShare, 0) / count,
    rankLost: search.reduce((s, c) => s + c.rankLostImpressionShare, 0) / count
  };
}

export function topByRoas<T extends { roas: number; cost: number }>(rows: T[], minCost = 10, limit = 10): T[] {
  return [...rows]
    .filter((row) => row.cost >= minCost && row.roas > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, limit);
}

export function channelTypeColor(channel: string): string {
  const key = channel.toUpperCase();
  if (key.includes("SEARCH")) return "#4285F4";
  if (key.includes("PERFORMANCE_MAX") || key.includes("PMAX")) return "#F59E0B";
  if (key.includes("DEMAND")) return "#A855F7";
  if (key.includes("DISPLAY")) return "#06B6D4";
  if (key.includes("VIDEO")) return "#EF4444";
  return "#71717A";
}

export function matchTypeColor(matchType: string): string {
  const key = matchType.toUpperCase();
  if (key === "EXACT") return "#1FBA5A";
  if (key === "PHRASE") return "#4285F4";
  if (key === "BROAD") return "#F59E0B";
  return "#71717A";
}

export type { GoogleAdsCampaignRow, GoogleAdsAdGroupRow, GoogleAdsCreativeRow, GoogleAdsKeywordRow };
