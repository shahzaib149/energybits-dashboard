import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import { mapDailyRecord, mapOverallRecord } from "@/lib/criteo-ads/map";
import type { CriteoDailyRow, CriteoOverallRow } from "@/lib/criteo-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { criteoAdsDateInRangeFormula } from "@/lib/date-range/airtable-filter";

const { criteo: CRITEO } = AIRTABLE_BASES;

export class CriteoAdsClient {
  private readonly client: AirtableBaseTableClient;

  constructor() {
    this.client = new AirtableBaseTableClient({
      baseName: CRITEO.name,
      defaultCacheTag: "airtable-criteo-ads",
      maxRecords: 1000
    });
  }

  private cacheTagsForRange(dateRange?: DateRange): string[] {
    if (dateRange) {
      return [`airtable-criteo-ads-${dateRange.from}-${dateRange.to}`];
    }
    return ["airtable-criteo-ads"];
  }

  async getDailyAnalytics(limit?: number, dateRange?: DateRange): Promise<CriteoDailyRow[]> {
    const dateFilter = dateRange ? criteoAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.client.fetchAllPages(CRITEO.tables.daily, mapDailyRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Day", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  async getOverallAnalytics(): Promise<CriteoOverallRow | null> {
    const rows = await this.client.fetchAllPages(CRITEO.tables.overall, mapOverallRecord, {
      maxRecords: 1,
      cacheTags: ["airtable-criteo-ads-overall"]
    });
    return rows[0] ?? null;
  }
}

let client: CriteoAdsClient | null = null;

export function getCriteoAdsClient(): CriteoAdsClient {
  if (!client) {
    client = new CriteoAdsClient();
  }
  return client;
}

export const criteoAds = {
  getDailyAnalytics: (limit?: number, dateRange?: DateRange) =>
    getCriteoAdsClient().getDailyAnalytics(limit, dateRange),
  getOverallAnalytics: () => getCriteoAdsClient().getOverallAnalytics()
};
