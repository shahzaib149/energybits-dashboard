import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import { klaviyoDateInRangeFormula } from "@/lib/date-range/airtable-filter";
import type { DateRange } from "@/lib/date-range/types";
import { mapKlaviyoRecord } from "@/lib/klaviyo/map";
import type { KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";

const { klaviyo: KLAVIYO } = AIRTABLE_BASES;

export class KlaviyoClient {
  private readonly client: AirtableBaseTableClient;

  constructor() {
    this.client = new AirtableBaseTableClient({
      baseName: KLAVIYO.name,
      defaultCacheTag: "airtable-klaviyo",
      maxRecords: 2000
    });
  }

  async getAnalytics(limit?: number, dateRange?: DateRange): Promise<KlaviyoAnalyticsRow[]> {
    const rows = await this.client.fetchAllPages(KLAVIYO.tables.analytics, mapKlaviyoRecord, {
      filterByFormula: dateRange ? klaviyoDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "Date", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-klaviyo-${dateRange.from}-${dateRange.to}`] : ["airtable-klaviyo"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }
}

let client: KlaviyoClient | null = null;

export function getKlaviyoClient() {
  if (!client) client = new KlaviyoClient();
  return client;
}

export const klaviyo = {
  getAnalytics: (limit?: number, dateRange?: DateRange) => getKlaviyoClient().getAnalytics(limit, dateRange)
};
