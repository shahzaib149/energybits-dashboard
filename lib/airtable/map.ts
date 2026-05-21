import type {
  AirtableRecordRaw,
  BrandType,
  GA4PageRow,
  GA4SourceRow,
  PageType,
  SEOOpportunityType,
  SEOPriority,
  SEOStatus,
  ActionStatus,
  SEOTrackingRow
} from "@/lib/airtable/types";

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

function asEnum<T extends string>(value: unknown, fallback: T): T {
  const text = asString(value);
  return (text || fallback) as T;
}

export function mapSEOTrackingRecord(record: AirtableRecordRaw): SEOTrackingRow {
  const f = record.fields;
  return {
    id: record.id,
    seoKey: asString(f["SEO Key"]),
    query: asString(f.Query),
    pageUrl: asString(f["Page URL"]),
    pageType: asEnum<PageType>(f["Page Type"], "Other"),
    clicks: asNumber(f.Clicks),
    impressions: asNumber(f.Impressions),
    ctr: asNumber(f.CTR),
    ctrPct: asNumber(f["CTR %"]),
    averagePosition: asNumber(f["Average Position"]),
    startDate: asString(f["Start Date"]),
    endDate: asString(f["End Date"]),
    brandType: asEnum<BrandType>(f["Brand Type"], "Non-Branded"),
    seoOpportunityType: asEnum<SEOOpportunityType>(f["SEO Opportunity Type"], "Low Priority"),
    seoPriority: asEnum<SEOPriority>(f["SEO Priority"], "Monitor"),
    recommendedAction: asString(f["Recommended Action"]),
    suggestedContentType: asString(f["Suggested Content Type"]),
    suggestedTargetProduct: asString(f["Suggested Target Product"]),
    status: asEnum<SEOStatus>(f.Status, "New"),
    actionStatus: asEnum<ActionStatus>(f["Action Status"], "Not Started"),
    lastChecked: asString(f["Last Checked"]),
    country: asString(f.Country) || undefined
  };
}

export function mapGA4PageRecord(record: AirtableRecordRaw): GA4PageRow {
  const f = record.fields;
  return {
    id: record.id,
    ga4Key: asString(f["GA4 Key"]),
    pagePath: asString(f["Page Path"]),
    pageTitle: asString(f["Page Title"]),
    sessions: asNumber(f.Sessions),
    activeUsers: asNumber(f["Active Users"]),
    newUsers: asNumber(f["New Users"]),
    engagedSessions: asNumber(f["Engaged Sessions"]),
    engagementRate: asNumber(f["Engagement Rate"]),
    engagementRatePct: asNumber(f["Engagement Rate %"]),
    averageSessionDuration: asNumber(f["Average Session Duration"]),
    bounceRate: asNumber(f["Bounce Rate"]),
    bounceRatePct: asNumber(f["Bounce Rate %"]),
    views: asNumber(f.Views),
    startDate: asString(f["Start Date"]),
    endDate: asString(f["End Date"])
  };
}

export function mapGA4SourceRecord(record: AirtableRecordRaw): GA4SourceRow {
  const f = record.fields;
  return {
    id: record.id,
    sourceKey: asString(f["Source Key"]),
    channelGroup: asString(f["Channel Group"]),
    source: asString(f.Source),
    medium: asString(f.Medium),
    sessions: asNumber(f.Sessions),
    activeUsers: asNumber(f["Active Users"]),
    newUsers: asNumber(f["New Users"]),
    engagedSessions: asNumber(f["Engaged Sessions"]),
    engagementRate: asNumber(f["Engagement Rate"]),
    engagementRatePct: asNumber(f["Engagement Rate %"]),
    averageSessionDuration: asNumber(f["Average Session Duration"]),
    bounceRate: asNumber(f["Bounce Rate"]),
    bounceRatePct: asNumber(f["Bounce Rate %"]),
    startDate: asString(f["Start Date"]),
    endDate: asString(f["End Date"])
  };
}

export function mapAirtableRecord<T>(
  record: AirtableRecordRaw,
  mapper: (raw: AirtableRecordRaw) => T
): T {
  return mapper(record);
}
