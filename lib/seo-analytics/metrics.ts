import type { GA4PageRow, GA4SourceRow, SEOTrackingRow } from "@/lib/airtable/types";

export function sumClicks(keywords: SEOTrackingRow[]): number {
  return keywords.reduce((sum, row) => sum + row.clicks, 0);
}

export function sumImpressions(keywords: SEOTrackingRow[]): number {
  return keywords.reduce((sum, row) => sum + row.impressions, 0);
}

export function averageCTR(keywords: SEOTrackingRow[]): number {
  const impressions = sumImpressions(keywords);
  if (impressions === 0) return 0;
  return (sumClicks(keywords) / impressions) * 100;
}

/** Weighted average position by impressions. */
export function weightedAveragePosition(keywords: SEOTrackingRow[]): number {
  const impressions = sumImpressions(keywords);
  if (impressions === 0) return 0;
  const weighted = keywords.reduce((sum, row) => sum + row.averagePosition * row.impressions, 0);
  return weighted / impressions;
}

export function latestEndDate(rows: Array<{ endDate: string }>): string | null {
  const dates = rows.map((r) => r.endDate).filter(Boolean);
  if (dates.length === 0) return null;
  return dates.sort((a, b) => b.localeCompare(a))[0];
}

export function inferPageTypeFromPath(path: string): string {
  if (path === "/" || path === "") return "Homepage";
  if (path.startsWith("/products/")) return "Product Pages";
  if (path.startsWith("/collections/")) return "Collection Pages";
  if (path.startsWith("/blogs/")) return "Blog Posts";
  if (path.startsWith("/pages/")) return "Static Pages";
  return "Other";
}

export function aggregatePageTypeSessions(pages: GA4PageRow[]): Array<{ type: string; sessions: number }> {
  const map = new Map<string, number>();
  for (const page of pages) {
    const type = inferPageTypeFromPath(page.pagePath);
    map.set(type, (map.get(type) ?? 0) + page.sessions);
  }
  return Array.from(map.entries())
    .map(([type, sessions]) => ({ type, sessions }))
    .sort((a, b) => b.sessions - a.sessions);
}

export function positionBucket(position: number): string {
  if (position <= 3) return "Position 1-3";
  if (position <= 10) return "Position 4-10";
  if (position <= 20) return "Position 11-20";
  if (position <= 50) return "Position 21-50";
  return "Position 51+";
}

export function buildPositionDistribution(keywords: SEOTrackingRow[]) {
  const buckets = new Map<string, number>();
  for (const row of keywords) {
    const bucket = positionBucket(row.averagePosition);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }
  const order = ["Position 1-3", "Position 4-10", "Position 11-20", "Position 21-50", "Position 51+"];
  const total = keywords.length || 1;
  return order
    .filter((name) => buckets.has(name))
    .map((name) => ({
      bucket: name,
      count: buckets.get(name) ?? 0,
      pct: ((buckets.get(name) ?? 0) / total) * 100
    }));
}

export function buildPriorityBreakdown(keywords: SEOTrackingRow[]) {
  const order = ["Critical", "High", "Medium", "Low", "Monitor"] as const;
  const counts = new Map<string, number>();
  for (const row of keywords) {
    counts.set(row.seoPriority, (counts.get(row.seoPriority) ?? 0) + 1);
  }
  return order
    .filter((name) => counts.has(name))
    .map((name) => ({ priority: name, count: counts.get(name) ?? 0 }));
}

export function dedupeKeywordsByQuery(keywords: SEOTrackingRow[]): SEOTrackingRow[] {
  const map = new Map<string, SEOTrackingRow>();
  for (const row of keywords) {
    const existing = map.get(row.query);
    if (!existing || row.clicks > existing.clicks) {
      map.set(row.query, row);
    }
  }
  return Array.from(map.values());
}

export function channelColor(channel: string): string {
  const key = channel.toLowerCase();
  if (key.includes("organic search")) return "#1FBA5A";
  if (key.includes("direct")) return "#3B82F6";
  if (key.includes("social")) return "#F59E0B";
  if (key.includes("email")) return "#A855F7";
  if (key.includes("paid")) return "#EF4444";
  if (key.includes("referral")) return "#06B6D4";
  return "#71717A";
}
