import type { CSVColumn } from "@/lib/csv/build";
import type { SEOTrackingRow, GA4PageRow, GA4SourceRow } from "@/lib/airtable/types";
import type {
  GoogleAdsCampaignRow,
  GoogleAdsAdGroupRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow
} from "@/lib/google-ads/types";
import type { BlogPipelineRow } from "@/lib/airtable/blog-pipeline";
import { exportFilenameSuffix } from "@/lib/date-range/format";
import type { DateRange } from "@/lib/date-range/types";

export function seoFilename(slug: string, dateRange?: DateRange): string {
  return `energybits-${slug}-${exportFilenameSuffix(dateRange)}`;
}

export function adsFilename(slug: string, dateRange: DateRange): string {
  return `energybits-${slug}-${exportFilenameSuffix(dateRange)}`;
}

export function staticFilename(slug: string): string {
  return `energybits-${slug}-${exportFilenameSuffix()}`;
}

export const seoKeywordColumns: CSVColumn<SEOTrackingRow>[] = [
  { key: "query", label: "Keyword" },
  { key: "pageUrl", label: "Page" },
  { key: "averagePosition", label: "Position", format: (v) => Number(v).toFixed(1) },
  { key: "ctrPct", label: "CTR %", format: (v) => Number(v).toFixed(2) },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Clicks" },
  { key: "seoOpportunityType", label: "Opportunity Type" },
  { key: "seoPriority", label: "Priority" },
  { key: "actionStatus", label: "Action Status" },
  { key: "recommendedAction", label: "Recommended Action" }
];

export const seoCriticalColumns: CSVColumn<SEOTrackingRow>[] = [
  { key: "query", label: "Keyword" },
  { key: "pageUrl", label: "Page" },
  { key: "averagePosition", label: "Position", format: (v) => Number(v).toFixed(1) },
  { key: "ctrPct", label: "CTR %", format: (v) => Number(v).toFixed(2) },
  { key: "impressions", label: "Impressions" },
  { key: "seoOpportunityType", label: "Opportunity Type" },
  { key: "actionStatus", label: "Action Status" },
  { key: "recommendedAction", label: "Recommended Action" }
];

export const ga4PageColumns: CSVColumn<GA4PageRow>[] = [
  { key: "pagePath", label: "Page Path" },
  { key: "pageTitle", label: "Page Title" },
  { key: "sessions", label: "Sessions" },
  { key: "bounceRatePct", label: "Bounce Rate %", format: (v) => Number(v).toFixed(2) },
  { key: "engagementRatePct", label: "Engagement Rate %", format: (v) => Number(v).toFixed(2) },
  { key: "averageSessionDuration", label: "Avg Session Duration", format: (v) => Number(v).toFixed(2) },
  { key: "views", label: "Views" }
];

export const ga4SourceColumns: CSVColumn<GA4SourceRow>[] = [
  { key: "source", label: "Source" },
  { key: "medium", label: "Medium" },
  { key: "channelGroup", label: "Channel" },
  { key: "sessions", label: "Sessions" },
  { key: "engagementRatePct", label: "Engagement Rate %", format: (v) => Number(v).toFixed(2) },
  { key: "bounceRatePct", label: "Bounce Rate %", format: (v) => Number(v).toFixed(2) },
  { key: "averageSessionDuration", label: "Avg Session Duration", format: (v) => Number(v).toFixed(2) }
];

export const campaignColumns: CSVColumn<GoogleAdsCampaignRow>[] = [
  { key: "campaignName", label: "Campaign" },
  { key: "channelType", label: "Type" },
  { key: "cost", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "clicks", label: "Clicks" },
  { key: "impressions", label: "Impressions" },
  { key: "conversions", label: "Conversions", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) },
  { key: "ctrPct", label: "CTR %", format: (v) => Number(v).toFixed(2) }
];

export const adGroupColumns: CSVColumn<GoogleAdsAdGroupRow>[] = [
  { key: "adGroupName", label: "Ad Group" },
  { key: "campaignName", label: "Campaign" },
  { key: "cost", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "clicks", label: "Clicks" },
  { key: "conversions", label: "Conversions", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export const creativeColumns: CSVColumn<GoogleAdsCreativeRow>[] = [
  { key: "adName", label: "Ad" },
  { key: "adType", label: "Type" },
  { key: "campaignName", label: "Campaign" },
  { key: "clicks", label: "Clicks" },
  { key: "cost", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "conversions", label: "Conversions", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export const keywordColumns: CSVColumn<GoogleAdsKeywordRow>[] = [
  { key: "keywordText", label: "Keyword" },
  { key: "matchType", label: "Match Type" },
  { key: "campaignName", label: "Campaign" },
  { key: "cost", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "clicks", label: "Clicks" },
  { key: "ctrPct", label: "CTR %", format: (v) => Number(v).toFixed(2) },
  { key: "conversions", label: "Conversions", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export const blogPipelineColumns: CSVColumn<BlogPipelineRow>[] = [
  { key: "blogTitle", label: "Title" },
  { key: "blogStatus", label: "Status" },
  { key: "targetKeyword", label: "Target Keyword" },
  { key: "submittedBy", label: "Submitted By" },
  { key: "primaryProduct", label: "Product" },
  { key: "funnelStage", label: "Funnel Stage" },
  { key: "notes", label: "Notes" }
];
