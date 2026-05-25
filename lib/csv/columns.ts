import type { CSVColumn } from "@/lib/csv/build";
import type { SEOTrackingRow, GA4PageRow, GA4SourceRow } from "@/lib/airtable/types";
import type {
  GoogleAdsCampaignRow,
  GoogleAdsAdGroupRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow
} from "@/lib/google-ads/types";
import type {
  CriteoAggregatedRow,
  CriteoDailyRow
} from "@/lib/criteo-ads/types";
import type { VibeAggregatedRow, VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import type { KlaviyoAnalyticsRow, KlaviyoMetricAggregateRow } from "@/lib/klaviyo/types";
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

export function criteoFilename(slug: string, dateRange: DateRange): string {
  return `energybits-${slug}-${exportFilenameSuffix(dateRange)}`;
}

export const criteoCampaignColumns: CSVColumn<CriteoAggregatedRow>[] = [
  { key: "label", label: "Campaign" },
  { key: "advertiserCost", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "clicks", label: "Clicks" },
  { key: "displays", label: "Displays" },
  { key: "ctrPct", label: "CTR %", format: (v) => Number(v).toFixed(2) },
  { key: "sales", label: "Sales", format: (v) => Number(v).toFixed(2) },
  { key: "revenue", label: "Revenue", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export const criteoAdColumns: CSVColumn<CriteoAggregatedRow>[] = [
  { key: "label", label: "Ad" },
  { key: "advertiserCost", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "clicks", label: "Clicks" },
  { key: "displays", label: "Displays" },
  { key: "cpc", label: "CPC", format: (v) => Number(v).toFixed(2) },
  { key: "revenue", label: "Revenue", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export const criteoDailyColumns: CSVColumn<CriteoDailyRow>[] = [
  { key: "day", label: "Day" },
  { key: "campaignName", label: "Campaign" },
  { key: "ad", label: "Ad" },
  { key: "advertiserCost", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "clicks", label: "Clicks" },
  { key: "displays", label: "Displays" },
  { key: "ctrPct", label: "CTR %", format: (v) => Number(v).toFixed(2) },
  { key: "cpc", label: "CPC", format: (v) => Number(v).toFixed(2) },
  { key: "salesAllClientAttribution", label: "Sales", format: (v) => Number(v).toFixed(2) },
  { key: "revenueGeneratedAllClientAttribution", label: "Revenue", format: (v) => Number(v).toFixed(2) },
  { key: "roasAllClientAttribution", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export function vibeFilename(slug: string, dateRange: DateRange): string {
  return `energybits-${slug}-${exportFilenameSuffix(dateRange)}`;
}

export const vibeAggregatedColumns: CSVColumn<VibeAggregatedRow>[] = [
  { key: "label", label: "Name" },
  { key: "spend", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "impressions", label: "Impressions" },
  { key: "completedViews", label: "Completed Views" },
  { key: "households", label: "Households" },
  { key: "cpm", label: "CPM", format: (v) => Number(v).toFixed(2) },
  { key: "viewThroughRatePct", label: "VTR %", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export const vibeDetailColumns: CSVColumn<VibeAnalyticsRow>[] = [
  { key: "impressionDate", label: "Date" },
  { key: "campaignName", label: "Campaign" },
  { key: "channelName", label: "Channel" },
  { key: "creativeName", label: "Creative" },
  { key: "geoRegion", label: "Region" },
  { key: "screen", label: "Screen" },
  { key: "strategyName", label: "Strategy" },
  { key: "spend", label: "Spend", format: (v) => Number(v).toFixed(2) },
  { key: "impressions", label: "Impressions" },
  { key: "completedViews", label: "Completed Views" },
  { key: "households", label: "Households" },
  { key: "cpm", label: "CPM", format: (v) => Number(v).toFixed(2) },
  { key: "viewThroughRatePct", label: "VTR %", format: (v) => Number(v).toFixed(2) },
  { key: "roas", label: "ROAS", format: (v) => Number(v).toFixed(2) }
];

export function klaviyoFilename(slug: string, dateRange: DateRange): string {
  return `energybits-${slug}-${exportFilenameSuffix(dateRange)}`;
}

export const klaviyoMetricColumns: CSVColumn<KlaviyoMetricAggregateRow>[] = [
  { key: "metricName", label: "Metric" },
  { key: "counts", label: "Events" },
  { key: "uniqueCounts", label: "Unique Contacts" },
  { key: "orderSumValue", label: "Order Value", format: (v) => Number(v).toFixed(2) },
  { key: "recordCount", label: "Rows" }
];

export const klaviyoDetailColumns: CSVColumn<KlaviyoAnalyticsRow>[] = [
  { key: "date", label: "Date" },
  { key: "metricName", label: "Metric" },
  { key: "metricId", label: "Metric ID" },
  { key: "counts", label: "Events" },
  { key: "uniqueCounts", label: "Unique Contacts" },
  { key: "orderSumValue", label: "Order Value", format: (v) => Number(v).toFixed(2) }
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
