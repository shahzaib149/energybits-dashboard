export type PageType =
  | "Homepage"
  | "Product Page"
  | "Collection Page"
  | "Blog Post"
  | "Page"
  | "Account/Utility"
  | "Other"
  | "All Pages";

export type BrandType = "Branded" | "Non-Branded" | "Mixed";

export type SEOOpportunityType =
  | "Strong Performer"
  | "High Impressions Low CTR"
  | "Page 1 CTR Improvement"
  | "Page 2 Ranking Opportunity"
  | "Position 21-50 Content Gap"
  | "Zero Click Opportunity"
  | "Branded Query"
  | "Cannibalization Risk"
  | "Low Priority";

export type SEOPriority = "Critical" | "High" | "Medium" | "Low" | "Monitor";

export type SEOStatus = "New" | "In Progress" | "Updated" | "Retest Needed" | "Improved" | "Ignored";

export interface SEOTrackingRow {
  id: string;
  seoKey: string;
  query: string;
  pageUrl: string;
  pageType: PageType;
  clicks: number;
  impressions: number;
  ctr: number;
  ctrPct: number;
  averagePosition: number;
  startDate: string;
  endDate: string;
  brandType: BrandType;
  seoOpportunityType: SEOOpportunityType;
  seoPriority: SEOPriority;
  recommendedAction: string;
  suggestedContentType: string;
  suggestedTargetProduct: string;
  status: SEOStatus;
  lastChecked: string;
  country?: string;
}

export interface GA4PageRow {
  id: string;
  ga4Key: string;
  pagePath: string;
  pageTitle: string;
  sessions: number;
  activeUsers: number;
  newUsers: number;
  engagedSessions: number;
  engagementRate: number;
  engagementRatePct: number;
  averageSessionDuration: number;
  bounceRate: number;
  bounceRatePct: number;
  views: number;
  startDate: string;
  endDate: string;
}

export interface GA4SourceRow {
  id: string;
  sourceKey: string;
  channelGroup: string;
  source: string;
  medium: string;
  sessions: number;
  activeUsers: number;
  newUsers: number;
  engagedSessions: number;
  engagementRate: number;
  engagementRatePct: number;
  averageSessionDuration: number;
  bounceRate: number;
  bounceRatePct: number;
  startDate: string;
  endDate: string;
}

export interface ChannelBreakdownRow {
  channel: string;
  sessions: number;
  pct: number;
}

export interface AirtableRecordRaw {
  id: string;
  fields: Record<string, unknown>;
}

export interface AirtableListResponse {
  records: AirtableRecordRaw[];
  offset?: string;
}
