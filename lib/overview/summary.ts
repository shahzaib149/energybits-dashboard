import { getCairrotClient } from "@/lib/cairrot/client";
import { isCairrotConfigured } from "@/lib/env";
import { airtable } from "@/lib/airtable/client";
import { isSEOAnalyticsConfigured } from "@/lib/seo-analytics/env";
import {
  averageCTR,
  sumClicks,
  weightedAveragePosition
} from "@/lib/seo-analytics/metrics";
import { googleAds } from "@/lib/google-ads/client";
import { isGoogleAdsConfigured } from "@/lib/google-ads/env";
import {
  overallRoas,
  sumConversions,
  sumCost
} from "@/lib/google-ads/metrics";
import { computeAtAGlance, formatBrandMentionPct } from "@/lib/utils/overview-display";
import {
  buildHealthScores,
  computeOverallScore,
  computeStandingLabel,
  sortChannelsSidebarOrder,
  type ChannelHealthScore
} from "@/lib/overview/health-scores";

export interface ChannelStat {
  label: string;
  value: string;
}

export interface AnalyticsChannelSummary {
  id: "aeo" | "geo" | "seo" | "googleAds";
  configured: boolean;
  headline: string;
  narrative: string;
  stats: ChannelStat[];
  href: string;
  accent: "brand" | "sky" | "green" | "amber";
}

import type { DateRange } from "@/lib/date-range/types";

export interface OverviewHubData {
  projectUrl: string | null;
  standingLabel: string;
  overallScore: number;
  healthScores: ChannelHealthScore[];
  channels: AnalyticsChannelSummary[];
}

function weakestGeoCategory(categories: Array<{ name: string; score: number }>): string | null {
  if (categories.length === 0) return null;
  const sorted = [...categories].sort((a, b) => a.score - b.score);
  return `${sorted[0].name} (${sorted[0].score}/100)`;
}

export async function fetchOverviewHubData(
  runId?: string,
  dateRange?: DateRange
): Promise<OverviewHubData> {
  const channels: AnalyticsChannelSummary[] = [];
  let projectUrl: string | null = null;

  if (isCairrotConfigured()) {
    try {
      const client = getCairrotClient();
      const dashboard = await client.getFullDashboard(runId);
      const { project, run } = dashboard;
      projectUrl = project.url;

      const aeoStats = computeAtAGlance(run);
      const aeoNarrative = `ENERGYbits is mentioned in ${formatBrandMentionPct(aeoStats.brandMentionPct)} of AI answers about your category. Brand appears in ${aeoStats.promptsWithBrand} of ${aeoStats.totalPrompts} tracked questions.`;

      channels.push({
        id: "aeo",
        configured: true,
        headline: "AI Search Visibility",
        narrative: aeoNarrative,
        stats: [
          { label: "Brand mention rate", value: formatBrandMentionPct(aeoStats.brandMentionPct) },
          { label: "Questions with brand", value: `${aeoStats.promptsWithBrand}/${aeoStats.totalPrompts}` },
          { label: "Total citations", value: run.totals.citations.toLocaleString() }
        ],
        href: "/aeo-analytics",
        accent: "brand"
      });

      const weakest = weakestGeoCategory(project.geo.categories);
      channels.push({
        id: "geo",
        configured: true,
        headline: "Site AI Readiness",
        narrative: `Your site scores ${project.geo.overallScore}/100 for AI readability.${weakest ? ` Focus area: ${weakest}.` : ""}`,
        stats: [
          { label: "Overall score", value: `${project.geo.overallScore}/100` },
          { label: "Weakest area", value: weakest ?? "—" },
          {
            label: "Categories tracked",
            value: String(project.geo.categories.length)
          }
        ],
        href: "/geo-analytics",
        accent: "sky"
      });
    } catch {
      channels.push(
        {
          id: "aeo",
          configured: false,
          headline: "AI Search Visibility",
          narrative: "Connect AI visibility analytics to see how ChatGPT, Gemini, and Perplexity mention ENERGYbits.",
          stats: [],
          href: "/aeo-analytics",
          accent: "brand"
        },
        {
          id: "geo",
          configured: false,
          headline: "Site AI Readiness",
          narrative: "Connect analytics to see how well your site is set up for AI engines to read and cite.",
          stats: [],
          href: "/geo-analytics",
          accent: "sky"
        }
      );
    }
  } else {
    channels.push(
      {
        id: "aeo",
        configured: false,
        headline: "AI Search Visibility",
        narrative: "Connect AI visibility analytics to see how ChatGPT, Gemini, and Perplexity mention ENERGYbits.",
        stats: [],
        href: "/aeo-analytics",
        accent: "brand"
      },
      {
        id: "geo",
        configured: false,
        headline: "Site AI Readiness",
        narrative: "Connect analytics to see how well your site is set up for AI engines to read and cite.",
        stats: [],
        href: "/geo-analytics",
        accent: "sky"
      }
    );
  }

  if (isSEOAnalyticsConfigured()) {
    try {
      const [keywords, critical] = await Promise.all([
        airtable.getSEOKeywords({ limit: 500, dateRange }),
        airtable.getCriticalKeywords(dateRange)
      ]);
      const clicks = sumClicks(keywords);
      channels.push({
        id: "seo",
        configured: true,
        headline: "Organic Search (SEO)",
        narrative: `Your site earned ${clicks.toLocaleString()} clicks from Google Search across ${keywords.length} tracked keyword rows.${critical.length > 0 ? ` ${critical.length} critical opportunities need attention.` : ""}`,
        stats: [
          { label: "Total clicks", value: clicks.toLocaleString() },
          { label: "Average CTR", value: `${averageCTR(keywords).toFixed(1)}%` },
          { label: "Avg. position", value: weightedAveragePosition(keywords).toFixed(1) }
        ],
        href: "/seo-analytics",
        accent: "green"
      });
    } catch {
      channels.push({
        id: "seo",
        configured: false,
        headline: "Organic Search (SEO)",
        narrative: "SEO data is configured but could not be loaded right now.",
        stats: [],
        href: "/seo-analytics",
        accent: "green"
      });
    }
  } else {
    channels.push({
      id: "seo",
      configured: false,
      headline: "Organic Search (SEO)",
      narrative: "Add SEO Airtable credentials to track Google Search clicks, rankings, and opportunities.",
      stats: [],
      href: "/seo-analytics",
      accent: "green"
    });
  }

  if (isGoogleAdsConfigured()) {
    try {
      const campaigns = await googleAds.getCampaigns(undefined, dateRange);
      const spend = sumCost(campaigns);
      const roas = overallRoas(campaigns);
      channels.push({
        id: "googleAds",
        configured: true,
        headline: "Google Ads",
        narrative: `You've spent ${spend.toLocaleString("en-US", { style: "currency", currency: "USD" })} across ${campaigns.length} campaigns with ${formatRoasDisplay(roas)} overall return.`,
        stats: [
          { label: "Total spend", value: spend.toLocaleString("en-US", { style: "currency", currency: "USD" }) },
          { label: "Overall ROAS", value: formatRoasDisplay(roas) },
          { label: "Conversions", value: sumConversions(campaigns).toLocaleString() }
        ],
        href: "/google-ads-analytics",
        accent: "amber"
      });
    } catch {
      channels.push({
        id: "googleAds",
        configured: false,
        headline: "Google Ads",
        narrative: "Google Ads data is configured but could not be loaded. Check Airtable permissions.",
        stats: [],
        href: "/google-ads-analytics",
        accent: "amber"
      });
    }
  } else {
    channels.push({
      id: "googleAds",
      configured: false,
      headline: "Google Ads",
      narrative: "Add Google Ads Airtable credentials to track spend, ROAS, and campaign performance.",
      stats: [],
      href: "/google-ads-analytics",
      accent: "amber"
    });
  }

  const orderedChannels = sortChannelsSidebarOrder(channels);
  const healthScores = buildHealthScores(orderedChannels);
  const overallScore = computeOverallScore(healthScores);
  const standingLabel = computeStandingLabel(overallScore, healthScores);

  return { projectUrl, standingLabel, overallScore, healthScores, channels: orderedChannels };
}

function formatRoasDisplay(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0.0x";
  return `${value.toFixed(2)}x`;
}
