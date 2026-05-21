import type { VibeAggregatedRow, VibeAnalyticsRow, VibeDailyTrendRow } from "@/lib/vibe-ads/types";

type SumRow = {
  spend: number;
  impressions: number;
  completedViews: number;
  households: number;
  numberOfSessions: number;
  numberOfLeads: number;
  numberOfPurchases: number;
  roasSum: number;
  roasCount: number;
  vtrSum: number;
  vtrCount: number;
};

function emptySum(): SumRow {
  return {
    spend: 0,
    impressions: 0,
    completedViews: 0,
    households: 0,
    numberOfSessions: 0,
    numberOfLeads: 0,
    numberOfPurchases: 0,
    roasSum: 0,
    roasCount: 0,
    vtrSum: 0,
    vtrCount: 0
  };
}

function addRow(target: SumRow, row: VibeAnalyticsRow) {
  target.spend += row.spend;
  target.impressions += row.impressions;
  target.completedViews += row.completedViews;
  target.households += row.households;
  target.numberOfSessions += row.numberOfSessions;
  target.numberOfLeads += row.numberOfLeads;
  target.numberOfPurchases += row.numberOfPurchases;
  if (row.roas > 0) {
    target.roasSum += row.roas;
    target.roasCount += 1;
  }
  if (row.viewThroughRatePct > 0) {
    target.vtrSum += row.viewThroughRatePct;
    target.vtrCount += 1;
  }
}

function toAggregated(label: string, m: SumRow): VibeAggregatedRow {
  return {
    label,
    spend: m.spend,
    impressions: m.impressions,
    completedViews: m.completedViews,
    households: m.households,
    sessions: m.numberOfSessions,
    leads: m.numberOfLeads,
    purchases: m.numberOfPurchases,
    roas: m.roasCount > 0 ? m.roasSum / m.roasCount : 0,
    cpm: m.impressions > 0 ? (m.spend / m.impressions) * 1000 : 0,
    viewThroughRatePct: m.vtrCount > 0 ? m.vtrSum / m.vtrCount : 0
  };
}

export function sumSpend(rows: VibeAnalyticsRow[]) {
  return rows.reduce((s, r) => s + r.spend, 0);
}
export function sumImpressions(rows: VibeAnalyticsRow[]) {
  return rows.reduce((s, r) => s + r.impressions, 0);
}
export function sumCompletedViews(rows: VibeAnalyticsRow[]) {
  return rows.reduce((s, r) => s + r.completedViews, 0);
}
export function sumHouseholds(rows: VibeAnalyticsRow[]) {
  return rows.reduce((s, r) => s + r.households, 0);
}
export function avgRoas(rows: VibeAnalyticsRow[]) {
  const valid = rows.filter((r) => r.roas > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((s, r) => s + r.roas, 0) / valid.length;
}

export function latestDay(rows: VibeAnalyticsRow[]) {
  const days = rows.map((r) => r.impressionDate).filter(Boolean);
  return days.length ? days.sort((a, b) => b.localeCompare(a))[0] : null;
}

export function uniqueCampaignCount(rows: VibeAnalyticsRow[]) {
  return new Set(rows.map((r) => r.campaignName).filter(Boolean)).size;
}

export function aggregateByField(
  rows: VibeAnalyticsRow[],
  field: keyof Pick<VibeAnalyticsRow, "campaignName" | "channelName" | "creativeName" | "screen" | "geoRegion">
): VibeAggregatedRow[] {
  const map = new Map<string, SumRow>();
  for (const row of rows) {
    const label = String(row[field] || "Unknown");
    const existing = map.get(label) ?? emptySum();
    addRow(existing, row);
    map.set(label, existing);
  }
  return Array.from(map.entries())
    .map(([label, m]) => toAggregated(label, m))
    .sort((a, b) => b.spend - a.spend);
}

export function aggregateByDay(rows: VibeAnalyticsRow[]): VibeDailyTrendRow[] {
  const map = new Map<string, SumRow>();
  for (const row of rows) {
    const day = row.impressionDate || "Unknown";
    const existing = map.get(day) ?? emptySum();
    addRow(existing, row);
    map.set(day, existing);
  }
  return Array.from(map.entries())
    .map(([day, m]) => ({
      day,
      spend: m.spend,
      impressions: m.impressions,
      completedViews: m.completedViews,
      roas: m.roasCount > 0 ? m.roasSum / m.roasCount : 0
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function buildSpendBreakdown(rows: VibeAnalyticsRow[], field: keyof VibeAnalyticsRow) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const name = String(row[field] || "Other");
    map.set(name, (map.get(name) ?? 0) + row.spend);
  }
  const total = Array.from(map.values()).reduce((s, n) => s + n, 0) || 1;
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value, pct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export function topByRoas(rows: VibeAggregatedRow[], minSpend = 5, limit = 8) {
  return [...rows].filter((r) => r.spend >= minSpend && r.roas > 0).sort((a, b) => b.roas - a.roas).slice(0, limit);
}

export function segmentColor(index: number) {
  const colors = ["#8B5CF6", "#EC4899", "#06B6D4", "#F59E0B", "#1FBA5A", "#EF4444"];
  return colors[index % colors.length];
}
