import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import { metaCampaignDateInRangeFormula, metaAdInsightsDateInRangeFormula } from "@/lib/date-range/airtable-filter";
import type { DateRange } from "@/lib/date-range/types";
import { mapMetaAdInsightRecord, mapMetaCampaignRecord } from "@/lib/meta-analytics/map";
import type { MetaAdInsightRow, MetaCampaignRow } from "@/lib/meta-analytics/types";

const { meta: META } = AIRTABLE_BASES;

export class MetaAnalyticsClient {
  private readonly client: AirtableBaseTableClient;

  constructor() {
    this.client = new AirtableBaseTableClient({
      baseName: META.name,
      defaultCacheTag: "airtable-meta",
      maxRecords: 2000
    });
  }

  async getCampaigns(limit?: number, dateRange?: DateRange): Promise<MetaCampaignRow[]> {
    const rows = await this.client.fetchAllPages(META.tables.campaigns, mapMetaCampaignRecord, {
      filterByFormula: dateRange ? metaCampaignDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "Date Start", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-meta-campaigns-${dateRange.from}-${dateRange.to}`] : ["airtable-meta-campaigns"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  async getAdInsights(limit?: number, dateRange?: DateRange): Promise<MetaAdInsightRow[]> {
    const rows = await this.client.fetchAllPages(META.tables.adInsights, mapMetaAdInsightRecord, {
      filterByFormula: dateRange ? metaAdInsightsDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "date_start", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-meta-ads-${dateRange.from}-${dateRange.to}`] : ["airtable-meta-ads"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }
}

let client: MetaAnalyticsClient | null = null;

export function getMetaAnalyticsClient(): MetaAnalyticsClient {
  if (!client) client = new MetaAnalyticsClient();
  return client;
}

export const metaAnalytics = {
  getCampaigns: (limit?: number, dateRange?: DateRange) =>
    getMetaAnalyticsClient().getCampaigns(limit, dateRange),
  getAdInsights: (limit?: number, dateRange?: DateRange) =>
    getMetaAnalyticsClient().getAdInsights(limit, dateRange)
};
