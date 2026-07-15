import type { GA4PageRow, GA4SourceRow, SEOTrackingRow } from "@/lib/airtable/types";

export interface SEOTrendPoint {
  period: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  keywordCount: number;
}

export interface GA4TrendPoint {
  period: string;
  sessions: number;
  avgEngagement: number;
  avgBounce: number;
  avgDuration: number;
}

export interface ChannelTrendPoint {
  period: string;
  [channel: string]: string | number;
}

export function aggregateKeywordsByPeriod(keywords: SEOTrackingRow[]): SEOTrendPoint[] {
  const map = new Map<string, SEOTrackingRow[]>();

  for (const row of keywords) {
    const period = row.endDate || "Unknown";
    const existing = map.get(period) ?? [];
    existing.push(row);
    map.set(period, existing);
  }

  return Array.from(map.entries())
    .map(([period, rows]) => {
      const clicks = rows.reduce((s, r) => s + r.clicks, 0);
      const impressions = rows.reduce((s, r) => s + r.impressions, 0);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const totalImpressions = impressions || 1;
      const avgPosition =
        rows.reduce((s, r) => s + r.averagePosition * r.impressions, 0) / totalImpressions;
      return { period, clicks, impressions, ctr, avgPosition, keywordCount: rows.length };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
}

export function aggregatePagesByPeriod(pages: GA4PageRow[]): GA4TrendPoint[] {
  const map = new Map<string, GA4PageRow[]>();

  for (const page of pages) {
    const period = page.endDate || "Unknown";
    const existing = map.get(period) ?? [];
    existing.push(page);
    map.set(period, existing);
  }

  return Array.from(map.entries())
    .map(([period, rows]) => {
      const sessions = rows.reduce((s, r) => s + r.sessions, 0);
      const total = sessions || 1;
      const avgEngagement =
        rows.reduce((s, r) => s + r.engagementRatePct * r.sessions, 0) / total;
      const avgBounce =
        rows.reduce((s, r) => s + r.bounceRatePct * r.sessions, 0) / total;
      const avgDuration =
        rows.reduce((s, r) => s + r.averageSessionDuration * r.sessions, 0) / total;
      return { period, sessions, avgEngagement, avgBounce, avgDuration };
    })
    .sort((a, b) => a.period.localeCompare(b.period));
}

export function aggregateChannelsByPeriod(sources: GA4SourceRow[]): ChannelTrendPoint[] {
  const periodChannels = new Map<string, Map<string, number>>();
  const allChannels = new Set<string>();

  for (const row of sources) {
    const period = row.endDate || "Unknown";
    const channel = row.channelGroup || "Other";
    allChannels.add(channel);

    if (!periodChannels.has(period)) periodChannels.set(period, new Map());
    const channelMap = periodChannels.get(period)!;
    channelMap.set(channel, (channelMap.get(channel) ?? 0) + row.sessions);
  }

  const channels = Array.from(allChannels).sort();

  return Array.from(periodChannels.entries())
    .map(([period, channelMap]) => {
      const point: ChannelTrendPoint = { period };
      for (const ch of channels) {
        point[ch] = channelMap.get(ch) ?? 0;
      }
      return point;
    })
    .sort((a, b) => (a.period as string).localeCompare(b.period as string));
}

export function getUniqueChannels(sources: GA4SourceRow[]): string[] {
  const channels = new Set<string>();
  for (const row of sources) {
    channels.add(row.channelGroup || "Other");
  }
  return Array.from(channels).sort();
}
