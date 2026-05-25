import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import { klaviyoDateInRangeFormula } from "@/lib/date-range/airtable-filter";
import type { DateRange } from "@/lib/date-range/types";
import { getKlaviyoEnv } from "@/lib/klaviyo/env";
import { mapKlaviyoRecord } from "@/lib/klaviyo/map";
import type { AirtableListResponse, AirtableRecordRaw, KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";

const REVALIDATE_SECONDS = 300;
const MAX_RECORDS = 2000;
const REQUEST_TIMEOUT_MS = 30_000;

type FetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  cacheTags?: string[];
};

export class KlaviyoClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly tableId: string;

  constructor(env: ReturnType<typeof getKlaviyoEnv>) {
    this.apiKey = env.AIRTABLE_API_KEY;
    this.baseId = env.AIRTABLE_KLAVIYO_BASE_ID;
    this.tableId = env.AIRTABLE_KLAVIYO_ANALYTICS_TABLE_ID;
  }

  private async request<T>(url: string, cacheTags?: string[]): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${this.apiKey}`, Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS, tags: cacheTags ?? ["airtable-klaviyo"] }
      });
      if (!response.ok) {
        throw new AirtableAPIError(await response.text(), response.status, url);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Klaviyo Airtable request timed out", 408, url);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(tableId: string, opts: FetchOpts = {}): string {
    const url = new URL(tableRecordsPath(this.baseId, tableId));
    if (opts.filterByFormula) url.searchParams.set("filterByFormula", opts.filterByFormula);
    opts.sort?.forEach((entry, index) => {
      url.searchParams.set(`sort[${index}][field]`, entry.field);
      url.searchParams.set(`sort[${index}][direction]`, entry.direction ?? "desc");
    });
    return url.toString();
  }

  private async fetchAllPages(mapper: (r: AirtableRecordRaw) => KlaviyoAnalyticsRow, opts: FetchOpts) {
    const results: KlaviyoAnalyticsRow[] = [];
    let offset: string | undefined;
    do {
      const baseUrl = this.buildUrl(this.tableId, opts);
      const url = offset ? `${baseUrl}&offset=${encodeURIComponent(offset)}` : baseUrl;
      const data = await this.request<AirtableListResponse>(url, opts.cacheTags);
      results.push(...data.records.map(mapper));
      offset = data.offset;
      if (results.length >= MAX_RECORDS) return results.slice(0, MAX_RECORDS);
    } while (offset);
    return results;
  }

  async getAnalytics(limit?: number, dateRange?: DateRange): Promise<KlaviyoAnalyticsRow[]> {
    const rows = await this.fetchAllPages(mapKlaviyoRecord, {
      filterByFormula: dateRange ? klaviyoDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "Date", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-klaviyo-${dateRange.from}-${dateRange.to}`] : ["airtable-klaviyo"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }
}

let client: KlaviyoClient | null = null;

export function getKlaviyoClient() {
  if (!client) client = new KlaviyoClient(getKlaviyoEnv());
  return client;
}

export const klaviyo = {
  getAnalytics: (limit?: number, dateRange?: DateRange) => getKlaviyoClient().getAnalytics(limit, dateRange)
};
