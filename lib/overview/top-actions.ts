import { getAirtableClient } from "@/lib/airtable/client";
import type { SEOTrackingRow } from "@/lib/airtable/types";
import type { GA4PageRow } from "@/lib/airtable/types";
import type { GoogleAdsCampaignRow } from "@/lib/google-ads/types";
import { getGoogleAdsClient } from "@/lib/google-ads/client";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { DateRange } from "@/lib/date-range/types";
import type { ActionItem, TopActionsResult } from "@/lib/overview/action-types";
import { formatNumber, formatPercent } from "@/lib/utils/format";

export function impactScore(item: ActionItem): number {
  if (item.source === "seo") {
    return (item.impressions ?? 0) * 1.0;
  }
  if (item.source === "ga4-bounce") {
    return (item.sessions ?? 0) * 0.5;
  }
  if (item.source === "google-ads-waste" || item.source === "google-ads-roas") {
    return (item.cost ?? 0) * 2.0;
  }
  return 0;
}

function pageTitleFromUrl(url: string): string {
  try {
    const path = url.replace("https://energybits.com", "").replace(/^\//, "");
    if (!path) return "homepage";
    return path.split("/").pop()?.replace(/-/g, " ") ?? path;
  } catch {
    return url;
  }
}

function seoActionItems(rows: SEOTrackingRow[]): ActionItem[] {
  return rows.slice(0, 3).map((row) => {
    const isPage2 = row.seoOpportunityType === "Page 2 Ranking Opportunity";
    const title = pageTitleFromUrl(row.pageUrl);
    const headline = isPage2
      ? `Push "${row.query}" to page 1 - currently ranking #${Math.round(row.averagePosition)}, ${formatNumber(row.impressions)} impressions`
      : `Update meta on "${title}" - ${formatNumber(row.impressions)} impressions, ${formatPercent(row.ctrPct)} CTR`;

    return {
      actionKey: `seo-${row.id}`,
      source: "seo" as const,
      headline,
      context: row.recommendedAction || row.pageUrl,
      href: "/seo-analytics?tab=search",
      recordId: row.id,
      impressions: row.impressions,
      score: 0
    };
  });
}

function ga4ActionItems(rows: GA4PageRow[]): ActionItem[] {
  return rows.slice(0, 2).map((row) => ({
    actionKey: `ga4-bounce-${row.id}`,
    source: "ga4-bounce" as const,
    headline: `Fix bounce rate on ${row.pagePath} - ${formatPercent(row.bounceRatePct)} bouncing from ${formatNumber(row.sessions)} sessions`,
    context: row.pageTitle || row.pagePath,
    href: "/seo-analytics?tab=pages",
    sessions: row.sessions,
    score: 0
  }));
}

function parseCampaignDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function aggregateCampaignsByWeek(campaigns: GoogleAdsCampaignRow[]) {
  const byCampaign = new Map<
    string,
    { name: string; recent: GoogleAdsCampaignRow[]; previous: GoogleAdsCampaignRow[] }
  >();

  const dates = campaigns
    .map((c) => parseCampaignDate(c.date))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length === 0) return [];

  const latest = dates[0]!;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const recentStart = new Date(latest.getTime() - weekMs);
  const previousStart = new Date(latest.getTime() - 2 * weekMs);

  for (const row of campaigns) {
    const d = parseCampaignDate(row.date);
    if (!d) continue;
    const key = row.campaignId || row.campaignName;
    if (!byCampaign.has(key)) {
      byCampaign.set(key, { name: row.campaignName, recent: [], previous: [] });
    }
    const bucket = byCampaign.get(key)!;
    if (d >= recentStart && d <= latest) bucket.recent.push(row);
    else if (d >= previousStart && d < recentStart) bucket.previous.push(row);
  }

  return Array.from(byCampaign.entries()).map(([id, data]) => {
    const sum = (rows: GoogleAdsCampaignRow[]) =>
      rows.reduce(
        (acc, r) => ({
          cost: acc.cost + r.cost,
          conversions: acc.conversions + r.conversions,
          conversionValue: acc.conversionValue + r.conversionValue
        }),
        { cost: 0, conversions: 0, conversionValue: 0 }
      );

    const recent = sum(data.recent);
    const previous = sum(data.previous);
    const recentRoas = recent.cost > 0 ? recent.conversionValue / recent.cost : 0;
    const previousRoas = previous.cost > 0 ? previous.conversionValue / previous.cost : 0;

    return {
      campaignId: id,
      campaignName: data.name,
      recentCost: recent.cost,
      recentConversions: recent.conversions,
      recentRoas,
      previousRoas,
      hasWoW: data.recent.length > 0 && data.previous.length > 0
    };
  });
}

function adsActionItems(campaigns: GoogleAdsCampaignRow[]): ActionItem[] {
  const aggregated = aggregateCampaignsByWeek(campaigns);
  const items: ActionItem[] = [];

  for (const c of aggregated) {
    if (c.recentCost <= 50) continue;

    if (c.hasWoW && c.previousRoas > 0) {
      const dropPct = ((c.previousRoas - c.recentRoas) / c.previousRoas) * 100;
      if (dropPct > 20) {
        items.push({
          actionKey: `ads-roas-${c.campaignId}`,
          source: "google-ads-roas",
          headline: `ROAS dropped ${Math.round(dropPct)}% on "${c.campaignName}" - now ${c.recentRoas.toFixed(1)}x vs ${c.previousRoas.toFixed(1)}x last week`,
          context: `Spend $${Math.round(c.recentCost)} this week`,
          href: "/google-ads-analytics?tab=campaigns",
          cost: c.recentCost,
          score: 0
        });
        continue;
      }
    }

    if (c.recentConversions === 0) {
      items.push({
        actionKey: `ads-waste-${c.campaignId}`,
        source: "google-ads-waste",
        headline: `Review "${c.campaignName}" - spent $${Math.round(c.recentCost)} with no conversions`,
        context: "Paid search campaign with spend but zero conversions",
        href: "/google-ads-analytics?tab=campaigns",
        cost: c.recentCost,
        score: 0
      });
    }
  }

  return items.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).slice(0, 2);
}

async function getDismissedActionKeys(): Promise<Set<string>> {
  const supabase = createServiceRoleClient();
  if (!supabase) return new Set();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const { data } = await supabase
    .from("dismissed_actions")
    .select("action_key")
    .gte("dismissed_at", cutoff.toISOString());

  return new Set((data ?? []).map((r) => r.action_key as string));
}

export async function fetchTopActions(dateRange?: DateRange): Promise<TopActionsResult> {
  const errors: string[] = [];
  const candidates: ActionItem[] = [];

  try {
    const seoRows = await getAirtableClient().getCriticalKeywordsPending(dateRange);
    candidates.push(...seoActionItems(seoRows.sort((a, b) => b.impressions - a.impressions)));
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "SEO data unavailable");
  }

  try {
    const ga4Rows = await getAirtableClient().getHighBouncePages(dateRange);
    candidates.push(...ga4ActionItems(ga4Rows));
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "GA4 data unavailable");
  }

  try {
    const adsClient = getGoogleAdsClient();
    const campaigns = await adsClient.getCampaigns(undefined, dateRange);
    candidates.push(...adsActionItems(campaigns));
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Google Ads data unavailable");
  }

  let dismissed = new Set<string>();
  try {
    dismissed = await getDismissedActionKeys();
  } catch {
    // non-fatal
  }

  const filtered = candidates
    .filter((c) => !dismissed.has(c.actionKey))
    .map((c) => ({ ...c, score: impactScore(c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { actions: filtered, errors };
}

/** Alias for spec naming */
export const topActions = { fetch: fetchTopActions };
