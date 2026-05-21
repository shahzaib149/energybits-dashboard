import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import { getVibeAdsEnv } from "@/lib/vibe-ads/env";
import { mapVibeRecord } from "@/lib/vibe-ads/map";
import type { AirtableListResponse, AirtableRecordRaw, VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { vibeAdsDateInRangeFormula } from "@/lib/date-range/airtable-filter";

const REVALIDATE_SECONDS = 300;
const MAX_RECORDS = 2000;
const REQUEST_TIMEOUT_MS = 30_000;

type FetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  cacheTags?: string[];
};

export class VibeAdsClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly tableId: string;

  constructor(env: ReturnType<typeof getVibeAdsEnv>) {
    this.apiKey = env.AIRTABLE_API_KEY;
    this.baseId = env.AIRTABLE_VIBE_ADS_BASE_ID;
    this.tableId = env.AIRTABLE_VIBE_ADS_ANALYTICS_TABLE_ID;
  }

  private async request<T>(url: string, cacheTags?: string[]): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${this.apiKey}`, Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS, tags: cacheTags ?? ["airtable-vibe-ads"] }
      });
      if (!response.ok) {
        throw new AirtableAPIError(await response.text(), response.status, url);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Vibe.co Airtable request timed out", 408, url);
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

  private async fetchAllPages(mapper: (r: AirtableRecordRaw) => VibeAnalyticsRow, opts: FetchOpts) {
    const results: VibeAnalyticsRow[] = [];
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

  async getAnalytics(limit?: number, dateRange?: DateRange): Promise<VibeAnalyticsRow[]> {
    const rows = await this.fetchAllPages(mapVibeRecord, {
      filterByFormula: dateRange ? vibeAdsDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "impression_date", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-vibe-ads-${dateRange.from}-${dateRange.to}`] : ["airtable-vibe-ads"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }
}

let client: VibeAdsClient | null = null;
export function getVibeAdsClient() {
  if (!client) client = new VibeAdsClient(getVibeAdsEnv());
  return client;
}

export const vibeAds = {
  getAnalytics: (limit?: number, dateRange?: DateRange) => getVibeAdsClient().getAnalytics(limit, dateRange)
};
