export interface AirtableRecordRaw {
  id: string;
  fields: Record<string, unknown>;
}

export interface AirtableListResponse {
  records: AirtableRecordRaw[];
  offset?: string;
}

export interface MetaCampaignRow {
  id: string;
  campaignId: string;
  campaignName: string;
  clicks: number;
  costPerUniqueClick: number;
  cpc: number;
  cpm: number;
  ctr: number;
  ctrPct: number;
  frequency: number;
  impressions: number;
  reach: number;
  spend: number;
  dateStart: string;
  dateStop: string;
}

export interface MetaAdInsightRow {
  id: string;
  accountId: string;
  accountName: string;
  adId: string;
  adName: string;
  adLink: string;
  clicks: number;
  qualityRanking: string;
  engagementRateRanking: string;
  conversionRateRanking: string;
  cpc: number;
  cpm: number;
  cpp: number;
  ctr: number;
  ctrPct: number;
  dateStart: string;
  dateStop: string;
  frequency: number;
  fullViewImpressions: number;
  fullViewReach: number;
  impressions: number;
  reach: number;
  socialSpend: number;
  spend: number;
  purchaseRoas: string;
  websitePurchaseRoas: string;
  actions: string;
}

export interface MetaAggregatedRow {
  id: string;
  label: string;
  adLink: string;
  clicks: number;
  impressions: number;
  reach: number;
  spend: number;
  ctrPct: number;
  cpc: number;
  cpm: number;
  frequency: number;
  recordCount: number;
}

export interface MetaDailyTrendRow {
  day: string;
  spend: number;
  clicks: number;
  impressions: number;
  reach: number;
}
