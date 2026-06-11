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

  private async getAdPreviewMap(): Promise<Map<string, string>> {
    try {
      const records = await this.client.fetchAllPages(
        META.tables.adPreview,
        (r) => ({ adId: String(r.fields.ad_id ?? "").trim(), adLink: String(r.fields.ad_link ?? "").trim() }),
        { cacheTags: ["airtable-meta-ad-preview"] }
      );
      const map = new Map<string, string>();
      for (const { adId, adLink } of records) {
        if (adId && adLink) map.set(adId, adLink);
      }
      return map;
    } catch {
      return new Map();
    }
  }

  private mergeAdLinks(rows: MetaAdInsightRow[], previewMap: Map<string, string>): MetaAdInsightRow[] {
    if (previewMap.size === 0) return rows;
    return rows.map((row) => ({
      ...row,
      adLink: previewMap.get(row.adId) || row.adLink || ""
    }));
  }

  /** Fetch all ad-insight records for a single ad name (for the detail page). */
  async getAdInsightsByName(adName: string): Promise<MetaAdInsightRow[]> {
    const escaped = adName.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    // Airtable column has a typo: the actual field is "add name" (double-d)
    const filter = `{add name} = "${escaped}"`;
    const [rows, previewMap] = await Promise.all([
      this.client.fetchAllPages(META.tables.adInsights, mapMetaAdInsightRecord, {
        filterByFormula: filter,
        sort: [{ field: "date_start", direction: "desc" }],
        noCache: true
      }),
      this.getAdPreviewMap()
    ]);
    return this.mergeAdLinks(rows, previewMap);
  }

  async getAdInsights(limit?: number, dateRange?: DateRange): Promise<MetaAdInsightRow[]> {
    const cacheTags = dateRange ? [`airtable-meta-ads-${dateRange.from}-${dateRange.to}`] : ["airtable-meta-ads"];
    const [rows, previewMap] = await Promise.all([
      this.client.fetchAllPages(META.tables.adInsights, mapMetaAdInsightRecord, {
        filterByFormula: dateRange ? metaAdInsightsDateInRangeFormula(dateRange) : undefined,
        sort: [{ field: "date_start", direction: "desc" }],
        cacheTags
      }),
      this.getAdPreviewMap()
    ]);
    const merged = this.mergeAdLinks(rows, previewMap);
    return limit ? merged.slice(0, limit) : merged;
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
      // Use campaigns table only (much smaller) — avoids concurrent reads on the large
      // facebook_ads_insights table which causes timeouts when other queries are in flight.
      const [oldest, newest] = await Promise.all([
        this.client.fetchAllPages(META.tables.campaigns, mapMetaCampaignRecord, {
          filterByFormula: 'NOT({Date Start} = "")',
          sort: [{ field: "Date Start", direction: "asc" }],
          maxRecords: 1,
          cacheTags: ["airtable-meta-bounds"]
        }),
        this.client.fetchAllPages(META.tables.campaigns, mapMetaCampaignRecord, {
          filterByFormula: 'NOT({Date Stop} = "")',
          sort: [{ field: "Date Stop", direction: "desc" }],
          maxRecords: 1,
          cacheTags: ["airtable-meta-bounds"]
        })
      ]);

      const minDate = oldest[0]?.dateStart;
      const maxDate = newest[0]?.dateStop;
      if (!minDate || !maxDate) return null;
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
  getAdInsightsByName: (adName: string) =>
    getMetaAnalyticsClient().getAdInsightsByName(adName),
  getDataBounds: () => getMetaAnalyticsClient().getDataBounds()
};
