import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import { metaCampaignDateInRangeFormula, metaAdInsightsDateInRangeFormula } from "@/lib/date-range/airtable-filter";
import type { DataBounds, DateRange } from "@/lib/date-range/types";
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

  /**
   * Checks both tables to get the true data range:
   * - facebook_ads_insights.date_start  → daily ad records (may lag behind campaign data)
   * - Meta Campaign Analytics.Date Start → campaign start dates (earliest data)
   * - Meta Campaign Analytics.Date Stop  → campaign end dates (may be the most recent date)
   *
   * Takes the overall min and max across both sources so the filter always reflects
   * what is actually in Airtable, even when the two sync schedules differ.
   */
  async getDataBounds(): Promise<DataBounds | null> {
    try {
      const [adOldest, adNewest, campOldest, campNewest] = await Promise.all([
        // Ad insights: earliest daily record
        this.client.fetchAllPages(META.tables.adInsights, mapMetaAdInsightRecord, {
          filterByFormula: 'NOT({date_start} = "")',
          sort: [{ field: "date_start", direction: "asc" }],
          maxRecords: 1,
          noCache: true
        }),
        // Ad insights: latest daily record
        this.client.fetchAllPages(META.tables.adInsights, mapMetaAdInsightRecord, {
          filterByFormula: 'NOT({date_start} = "")',
          sort: [{ field: "date_start", direction: "desc" }],
          maxRecords: 1,
          noCache: true
        }),
        // Campaigns: earliest campaign start
        this.client.fetchAllPages(META.tables.campaigns, mapMetaCampaignRecord, {
          filterByFormula: 'NOT({Date Start} = "")',
          sort: [{ field: "Date Start", direction: "asc" }],
          maxRecords: 1,
          noCache: true
        }),
        // Campaigns: latest campaign end (Date Stop) — often the most recent date
        this.client.fetchAllPages(META.tables.campaigns, mapMetaCampaignRecord, {
          filterByFormula: 'NOT({Date Stop} = "")',
          sort: [{ field: "Date Stop", direction: "desc" }],
          maxRecords: 1,
          noCache: true
        })
      ]);

      // Collect all non-empty candidates for each bound
      const minCandidates = [adOldest[0]?.dateStart, campOldest[0]?.dateStart].filter(Boolean) as string[];
      const maxCandidates = [adNewest[0]?.dateStart, campNewest[0]?.dateStop].filter(Boolean) as string[];

      if (minCandidates.length === 0 || maxCandidates.length === 0) return null;

      const minDate = minCandidates.sort()[0];                        // earliest
      const maxDate = maxCandidates.sort().reverse()[0];              // latest

      return { minDate, maxDate };
    } catch {
      return null;
    }
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
    getMetaAnalyticsClient().getAdInsights(limit, dateRange),
  getDataBounds: () => getMetaAnalyticsClient().getDataBounds()
};
