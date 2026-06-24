export interface AirtableRecordRaw {
  id: string;
  fields: Record<string, unknown>;
}

export interface AirtableListResponse {
  records: AirtableRecordRaw[];
  offset?: string;
}

export interface GoogleAdsCampaignRow {
  id: string;
  uniqueKey: string;
  date: string;
  platform: string;
  accountId: string;
  accountName: string;
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  channelType: string;
  biddingStrategy: string;
  optimizationScore: number;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  ctrPct: number;
  averageCpc: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
  conversionRate: number;
  conversionRatePct: number;
  searchImpressionShare: number;
  budgetLostImpressionShare: number;
  rankLostImpressionShare: number;
  roas: number;
  pulledAt: string;
}

export interface GoogleAdsAdGroupRow {
  id: string;
  uniqueKey: string;
  date: string;
  platform: string;
  accountId: string;
  accountName: string;
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  adGroupStatus: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  ctrPct: number;
  averageCpc: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
  conversionRate: number;
  conversionRatePct: number;
  roas: number;
  pulledAt: string;
}

export interface GoogleAdsCreativeRow {
  id: string;
  uniqueKey: string;
  date: string;
  platform: string;
  accountId: string;
  accountName: string;
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  adId: string;
  adName: string;
  adStatus: string;
  adType: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  ctrPct: number;
  averageCpc: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
  conversionRate: number;
  conversionRatePct: number;
  roas: number;
  pulledAt: string;
  creativeTagSuggestions: string;
}

export interface GoogleAdsKeywordRow {
  id: string;
  uniqueKey: string;
  date: string;
  platform: string;
  accountId: string;
  accountName: string;
  campaignId: string;
  campaignName: string;
  adGroupId: string;
  adGroupName: string;
  keywordId: string;
  keywordText: string;
  matchType: string;
  keywordStatus: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  ctrPct: number;
  averageCpc: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
  conversionRate: number;
  conversionRatePct: number;
  roas: number;
  pulledAt: string;
}

export interface GoogleAdsPreviewRow {
  id: string;
  adId: string;
  adName: string;
  adType: string;
  youtubeId: string;
  imageUrls: string[];
  adLink: string;
  headlines: string[];
  descriptions: string[];
  ctaText: string;
}

export interface AggregatedMetricRow {
  label: string;
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
  roas: number;
  ctrPct: number;
}

export interface BreakdownRow {
  name: string;
  value: number;
  pct: number;
}
