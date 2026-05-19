import type { AnalyticsChannelSummary } from "@/lib/overview/summary";

export type HealthStatus = "excellent" | "good" | "fair" | "needs-attention" | "unavailable";

export interface ChannelHealthScore {
  id: AnalyticsChannelSummary["id"];
  label: string;
  shortLabel: string;
  score: number;
  status: HealthStatus;
  primaryMetric: string;
  insight: string;
  href: string;
  color: string;
  configured: boolean;
}

const CHANNEL_COLORS = {
  seo: "#1FBA5A",
  aeo: "#8B5CF6",
  geo: "#38BDF8",
  googleAds: "#F59E0B"
} as const;

const CHANNEL_ORDER: Array<keyof typeof CHANNEL_COLORS> = ["seo", "aeo", "geo", "googleAds"];

export function scoreToStatus(score: number, configured: boolean): HealthStatus {
  if (!configured || score <= 0) return "unavailable";
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "needs-attention";
}

export function statusLabel(status: HealthStatus): string {
  if (status === "excellent") return "Excellent";
  if (status === "good") return "Good";
  if (status === "fair") return "Fair";
  if (status === "needs-attention") return "Needs attention";
  return "Not connected";
}

export function normalizeSeoScore(avgPosition: number, avgCtrPct: number): number {
  const positionScore = Math.max(0, Math.min(100, 100 - avgPosition * 3.2));
  const ctrScore = Math.max(0, Math.min(100, avgCtrPct * 12));
  return Math.round(positionScore * 0.55 + ctrScore * 0.45);
}

/** ROAS 1x ≈ 40, 4x ≈ 80, 6x+ caps at 100 */
export function normalizeRoasScore(roas: number): number {
  if (!Number.isFinite(roas) || roas <= 0) return 0;
  return Math.round(Math.max(0, Math.min(100, roas * 20)));
}

export function computeOverallScore(scores: ChannelHealthScore[]): number {
  const active = scores.filter((s) => s.configured && s.score > 0);
  if (active.length === 0) return 0;
  return Math.round(active.reduce((sum, s) => sum + s.score, 0) / active.length);
}

export function computeStandingLabel(overall: number, scores: ChannelHealthScore[]): string {
  const active = scores.filter((s) => s.configured);
  if (active.length === 0) {
    return "Connect your analytics sources to see where ENERGYbits stands today.";
  }
  if (overall >= 78) {
    return "ENERGYbits is performing strongly across your connected marketing channels.";
  }
  if (overall >= 58) {
    return "Solid overall performance — a few targeted improvements could unlock more growth.";
  }
  const weakest = [...active].sort((a, b) => a.score - b.score)[0];
  return `Focus on ${weakest.label} first — it's your biggest opportunity right now.`;
}

export function buildHealthScores(channels: AnalyticsChannelSummary[]): ChannelHealthScore[] {
  const byId = new Map(channels.map((c) => [c.id, c]));
  const scores: ChannelHealthScore[] = [];

  for (const id of CHANNEL_ORDER) {
    const channel = byId.get(id);
    if (!channel) continue;

    let score = 0;
    let primaryMetric = "—";
    let insight = channel.narrative;

    if (channel.configured && channel.stats.length > 0) {
      if (id === "aeo") {
        const mention = channel.stats.find((s) => s.label === "Brand mention rate")?.value ?? "0%";
        score = Math.round(parseFloat(mention.replace("%", "")) || 0);
        primaryMetric = mention;
      } else if (id === "geo") {
        const overall = channel.stats.find((s) => s.label === "Overall score")?.value ?? "0/100";
        score = Math.round(parseFloat(overall.split("/")[0]) || 0);
        primaryMetric = overall;
      } else if (id === "seo") {
        const ctr = parseFloat(channel.stats.find((s) => s.label === "Average CTR")?.value ?? "0");
        const pos = parseFloat(channel.stats.find((s) => s.label === "Avg. position")?.value ?? "50");
        score = normalizeSeoScore(pos, ctr);
        primaryMetric = channel.stats.find((s) => s.label === "Total clicks")?.value ?? "—";
      } else if (id === "googleAds") {
        const roasStr = channel.stats.find((s) => s.label === "Overall ROAS")?.value ?? "0x";
        const roas = parseFloat(roasStr.replace("x", "")) || 0;
        score = normalizeRoasScore(roas);
        primaryMetric = roasStr;
      }
    }

    const status = scoreToStatus(score, channel.configured);

    scores.push({
      id,
      label: channel.headline,
      shortLabel: id === "seo" ? "SEO" : id === "aeo" ? "AEO" : id === "geo" ? "GEO" : "Ads",
      score,
      status,
      primaryMetric,
      insight: channel.configured ? channel.narrative.split(".")[0] + "." : channel.narrative,
      href: channel.href,
      color: CHANNEL_COLORS[id],
      configured: channel.configured
    });
  }

  return scores;
}

export function sortChannelsSidebarOrder(channels: AnalyticsChannelSummary[]): AnalyticsChannelSummary[] {
  const order: AnalyticsChannelSummary["id"][] = ["seo", "aeo", "geo", "googleAds"];
  return order.map((id) => channels.find((c) => c.id === id)).filter(Boolean) as AnalyticsChannelSummary[];
}
