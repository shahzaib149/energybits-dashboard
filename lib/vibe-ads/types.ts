export interface AirtableRecordRaw {
  id: string;
  fields: Record<string, unknown>;
}

export interface AirtableListResponse {
  records: AirtableRecordRaw[];
  offset?: string;
}

export interface VibeAnalyticsRow {
  id: string;
  campaignName: string;
  impressionDate: string;
  channelName: string;
  creativeName: string;
  geoRegion: string;
  impressionTime: string;
  screen: string;
  strategyName: string;
  amountOfPurchases: number;
  completedViews: number;
  costPerCompletedView: number;
  costPerLead: number;
  costPerPageView: number;
  costPerPurchase: number;
  costPerSession: number;
  cpm: number;
  frequency: number;
  households: number;
  impressions: number;
  numberOfLeads: number;
  numberOfPageViews: number;
  numberOfPurchases: number;
  numberOfSessions: number;
  roas: number;
  spend: number;
  viewThroughRate: number;
  viewThroughRatePct: number;
}

export interface VibeAggregatedRow {
  label: string;
  spend: number;
  impressions: number;
  completedViews: number;
  households: number;
  sessions: number;
  leads: number;
  purchases: number;
  roas: number;
  cpm: number;
  viewThroughRatePct: number;
}

export interface VibeDailyTrendRow {
  day: string;
  spend: number;
  impressions: number;
  completedViews: number;
  roas: number;
}
