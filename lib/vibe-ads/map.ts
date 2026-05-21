import type { AirtableRecordRaw, VibeAnalyticsRow } from "@/lib/vibe-ads/types";

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asRate(value: unknown): { rate: number; ratePct: number } {
  const raw = asNumber(value);
  if (raw <= 1 && raw > 0) return { rate: raw, ratePct: raw * 100 };
  return { rate: raw / 100, ratePct: raw };
}

export function mapVibeRecord(record: AirtableRecordRaw): VibeAnalyticsRow {
  const f = record.fields;
  const vtr = asRate(f.view_through_rate);

  return {
    id: record.id,
    campaignName: asString(f.campaign_name),
    impressionDate: asString(f.impression_date),
    channelName: asString(f.channel_name),
    creativeName: asString(f.creative_name),
    geoRegion: asString(f.geo_region),
    impressionTime: asString(f.impression_time),
    screen: asString(f.screen),
    strategyName: asString(f.strategy_name),
    amountOfPurchases: asNumber(f.amount_of_purchases),
    completedViews: asNumber(f.completed_views),
    costPerCompletedView: asNumber(f.cost_per_completed_view),
    costPerLead: asNumber(f.cost_per_lead),
    costPerPageView: asNumber(f.cost_per_page_view),
    costPerPurchase: asNumber(f.cost_per_purchase),
    costPerSession: asNumber(f.cost_per_session),
    cpm: asNumber(f.cpm),
    frequency: asNumber(f.frequency),
    households: asNumber(f.households),
    impressions: asNumber(f.impressions),
    numberOfLeads: asNumber(f.number_of_leads),
    numberOfPageViews: asNumber(f.number_of_page_views),
    numberOfPurchases: asNumber(f.number_of_purchases),
    numberOfSessions: asNumber(f.number_of_sessions),
    roas: asNumber(f.roas),
    spend: asNumber(f.spend),
    viewThroughRate: vtr.rate,
    viewThroughRatePct: vtr.ratePct
  };
}
