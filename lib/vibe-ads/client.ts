import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import { mapVibeRecord } from "@/lib/vibe-ads/map";
import type { VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import type { DataBounds, DateRange } from "@/lib/date-range/types";
import { vibeAdsDateInRangeFormula } from "@/lib/date-range/airtable-filter";

const { vibe: VIBE } = AIRTABLE_BASES;

export class VibeAdsClient {
  private readonly client: AirtableBaseTableClient;

  constructor() {
    this.client = new AirtableBaseTableClient({
      baseName: VIBE.name,
      defaultCacheTag: "airtable-vibe-ads",
      maxRecords: 2000
    });
  }

  async getAnalytics(limit?: number, dateRange?: DateRange): Promise<VibeAnalyticsRow[]> {
    const rows = await this.client.fetchAllPages(VIBE.tables.analytics, mapVibeRecord, {
      filterByFormula: dateRange ? vibeAdsDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "impression_date", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-vibe-ads-${dateRange.from}-${dateRange.to}`] : ["airtable-vibe-ads"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  async getDataBounds(): Promise<DataBounds | null> {
    try {
      const [oldest, newest] = await Promise.all([
        this.client.fetchAllPages(VIBE.tables.analytics, mapVibeRecord, {
          filterByFormula: 'NOT({impression_date} = "")',
          sort: [{ field: "impression_date", direction: "asc" }],
          maxRecords: 1,
          noCache: true
        }),
        this.client.fetchAllPages(VIBE.tables.analytics, mapVibeRecord, {
          filterByFormula: 'NOT({impression_date} = "")',
          sort: [{ field: "impression_date", direction: "desc" }],
          maxRecords: 1,
          noCache: true
        })
      ]);
      const minDate = oldest[0]?.impressionDate;
      const maxDate = newest[0]?.impressionDate;
      if (!minDate || !maxDate) return null;
      return { minDate, maxDate };
    } catch {
      return null;
    }
  }
}

let client: VibeAdsClient | null = null;

export function getVibeAdsClient() {
  if (!client) client = new VibeAdsClient();
  return client;
}

export const vibeAds = {
  getAnalytics: (limit?: number, dateRange?: DateRange) => getVibeAdsClient().getAnalytics(limit, dateRange),
  getDataBounds: () => getVibeAdsClient().getDataBounds()
};
