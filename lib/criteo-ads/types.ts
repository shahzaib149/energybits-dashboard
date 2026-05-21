export interface AirtableRecordRaw {
  id: string;
  fields: Record<string, unknown>;
}

export interface AirtableListResponse {
  records: AirtableRecordRaw[];
  offset?: string;
}

export interface CriteoDailyRow {
  id: string;
  campaignId: string;
  campaignName: string;
  adsetId: string;
  adsetBits: string;
  adId: string;
  ad: string;
  day: string;
  currency: string;
  clicks: number;
  displays: number;
  advertiserCost: number;
  salesAllClientAttribution: number;
  revenueGeneratedAllClientAttribution: number;
  roasAllClientAttribution: number;
  frequency: number;
  cpc: number;
  eCpm: number;
  ctrPct: number;
}

export interface CriteoOverallRow {
  id: string;
  clicks: number;
  displays: number;
  advertiserCost: number;
  salesAllClientAttribution: number;
  revenueGeneratedAllClientAttribution: number;
  roasAllClientAttribution: number;
  reach: number;
  frequency: number;
  clickThroughRate: number;
  cpc: number;
  eCpm: number;
}

export interface CriteoAggregatedRow {
  label: string;
  advertiserCost: number;
  clicks: number;
  displays: number;
  sales: number;
  revenue: number;
  roas: number;
  ctrPct: number;
  cpc: number;
  eCpm: number;
}

export interface CriteoDailyTrendRow {
  day: string;
  advertiserCost: number;
  clicks: number;
  displays: number;
  revenue: number;
  roas: number;
}

export interface BreakdownRow {
  name: string;
  value: number;
  pct: number;
}
