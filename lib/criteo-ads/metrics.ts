import type {
  BreakdownRow,
  CriteoAggregatedRow,
  CriteoDailyRow,
  CriteoDailyTrendRow
} from "@/lib/criteo-ads/types";

type MetricRow = {
  advertiserCost: number;
  clicks: number;
  displays: number;
  salesAllClientAttribution: number;
  revenueGeneratedAllClientAttribution: number;
};

function computeRoas(revenue: number, cost: number): number {
  if (cost <= 0) return 0;
  return revenue / cost;
}

function computeCtrPct(clicks: number, displays: number): number {
  if (displays <= 0) return 0;
  return (clicks / displays) * 100;
}

function computeCpc(cost: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return cost / clicks;
}

function computeECpm(cost: number, displays: number): number {
  if (displays <= 0) return 0;
  return (cost / displays) * 1000;
}

export function sumAdvertiserCost(rows: Array<{ advertiserCost: number }>): number {
  return rows.reduce((sum, row) => sum + row.advertiserCost, 0);
}

export function sumClicks(rows: Array<{ clicks: number }>): number {
  return rows.reduce((sum, row) => sum + row.clicks, 0);
}

export function sumDisplays(rows: Array<{ displays: number }>): number {
  return rows.reduce((sum, row) => sum + row.displays, 0);
}

export function sumSales(rows: Array<{ salesAllClientAttribution: number }>): number {
  return rows.reduce((sum, row) => sum + row.salesAllClientAttribution, 0);
}

export function sumRevenue(rows: Array<{ revenueGeneratedAllClientAttribution: number }>): number {
  return rows.reduce((sum, row) => sum + row.revenueGeneratedAllClientAttribution, 0);
}

export function overallRoas(rows: MetricRow[]): number {
  return computeRoas(sumRevenue(rows), sumAdvertiserCost(rows));
}

export function overallCtrPct(rows: MetricRow[]): number {
  return computeCtrPct(sumClicks(rows), sumDisplays(rows));
}

export function latestDay(rows: Array<{ day: string }>): string | null {
  const days = rows.map((r) => r.day).filter(Boolean);
  if (days.length === 0) return null;
  return days.sort((a, b) => b.localeCompare(a))[0];
}

export function uniqueCampaignCount(rows: CriteoDailyRow[]): number {
  return new Set(rows.map((r) => r.campaignId || r.campaignName).filter(Boolean)).size;
}

export function aggregateByField(
  rows: CriteoDailyRow[],
  field: keyof Pick<CriteoDailyRow, "campaignName" | "ad" | "adsetId">
): CriteoAggregatedRow[] {
  const map = new Map<string, MetricRow & { cpcSum: number; eCpmSum: number; count: number }>();

  for (const row of rows) {
    const label = String(row[field] || "Unknown");
    const existing = map.get(label) ?? {
      advertiserCost: 0,
      clicks: 0,
      displays: 0,
      salesAllClientAttribution: 0,
      revenueGeneratedAllClientAttribution: 0,
      cpcSum: 0,
      eCpmSum: 0,
      count: 0
    };
    existing.advertiserCost += row.advertiserCost;
    existing.clicks += row.clicks;
    existing.displays += row.displays;
    existing.salesAllClientAttribution += row.salesAllClientAttribution;
    existing.revenueGeneratedAllClientAttribution += row.revenueGeneratedAllClientAttribution;
    existing.cpcSum += row.cpc;
    existing.eCpmSum += row.eCpm;
    existing.count += 1;
    map.set(label, existing);
  }

  return Array.from(map.entries())
    .map(([label, metrics]) => ({
      label,
      advertiserCost: metrics.advertiserCost,
      clicks: metrics.clicks,
      displays: metrics.displays,
      sales: metrics.salesAllClientAttribution,
      revenue: metrics.revenueGeneratedAllClientAttribution,
      roas: computeRoas(metrics.revenueGeneratedAllClientAttribution, metrics.advertiserCost),
      ctrPct: computeCtrPct(metrics.clicks, metrics.displays),
      cpc: computeCpc(metrics.advertiserCost, metrics.clicks),
      eCpm: computeECpm(metrics.advertiserCost, metrics.displays)
    }))
    .sort((a, b) => b.advertiserCost - a.advertiserCost);
}

export function aggregateByDay(rows: CriteoDailyRow[]): CriteoDailyTrendRow[] {
  const map = new Map<string, MetricRow>();

  for (const row of rows) {
    const day = row.day || "Unknown";
    const existing = map.get(day) ?? {
      advertiserCost: 0,
      clicks: 0,
      displays: 0,
      salesAllClientAttribution: 0,
      revenueGeneratedAllClientAttribution: 0
    };
    existing.advertiserCost += row.advertiserCost;
    existing.clicks += row.clicks;
    existing.displays += row.displays;
    existing.salesAllClientAttribution += row.salesAllClientAttribution;
    existing.revenueGeneratedAllClientAttribution += row.revenueGeneratedAllClientAttribution;
    map.set(day, existing);
  }

  return Array.from(map.entries())
    .map(([day, metrics]) => ({
      day,
      advertiserCost: metrics.advertiserCost,
      clicks: metrics.clicks,
      displays: metrics.displays,
      revenue: metrics.revenueGeneratedAllClientAttribution,
      roas: computeRoas(metrics.revenueGeneratedAllClientAttribution, metrics.advertiserCost)
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function buildCostBreakdown(rows: CriteoDailyRow[], field: keyof CriteoDailyRow): BreakdownRow[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const name = String(row[field] || "Other");
    map.set(name, (map.get(name) ?? 0) + row.advertiserCost);
  }
  const total = Array.from(map.values()).reduce((sum, n) => sum + n, 0) || 1;
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value, pct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export function topByRoas(rows: CriteoAggregatedRow[], minCost = 10, limit = 10): CriteoAggregatedRow[] {
  return [...rows]
    .filter((row) => row.advertiserCost >= minCost && row.roas > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, limit);
}

export function campaignColor(index: number): string {
  const colors = ["#FF6B00", "#F59E0B", "#4285F4", "#1FBA5A", "#A855F7", "#06B6D4", "#EF4444"];
  return colors[index % colors.length];
}
