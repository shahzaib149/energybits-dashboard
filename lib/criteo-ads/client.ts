import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import { getCriteoAdsEnv } from "@/lib/criteo-ads/env";
import { mapDailyRecord, mapOverallRecord } from "@/lib/criteo-ads/map";
import type {
  AirtableListResponse,
  AirtableRecordRaw,
  CriteoDailyRow,
  CriteoOverallRow
} from "@/lib/criteo-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { criteoAdsDateInRangeFormula } from "@/lib/date-range/airtable-filter";

const REVALIDATE_SECONDS = 300;
const MAX_RECORDS = 1000;
const REQUEST_TIMEOUT_MS = 30_000;

type FetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  maxRecords?: number;
  cacheTags?: string[];
};

export class CriteoAdsClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly dailyTableId: string;
  private readonly overallTableId: string;

  constructor(env: ReturnType<typeof getCriteoAdsEnv>) {
    this.apiKey = env.AIRTABLE_API_KEY;
    this.baseId = env.AIRTABLE_CRITEO_ADS_BASE_ID;
    this.dailyTableId = env.AIRTABLE_CRITEO_ADS_DAILY_TABLE_ID;
    this.overallTableId = env.AIRTABLE_CRITEO_ADS_OVERALL_TABLE_ID;
  }

  private async request<T>(url: string, cacheTags?: string[]): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json"
        },
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: cacheTags ?? ["airtable-criteo-ads"]
        }
      });

      if (!response.ok) {
        const message = await response.text();
        throw new AirtableAPIError(message || "Criteo Ads Airtable request failed", response.status, url);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Criteo Ads Airtable request timed out", 408, url);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(tableId: string, opts: FetchOpts = {}): string {
    const url = new URL(tableRecordsPath(this.baseId, tableId));
    if (opts.filterByFormula) {
      url.searchParams.set("filterByFormula", opts.filterByFormula);
    }
    if (opts.maxRecords) {
      url.searchParams.set("maxRecords", String(opts.maxRecords));
    }
    opts.sort?.forEach((entry, index) => {
      url.searchParams.set(`sort[${index}][field]`, entry.field);
      url.searchParams.set(`sort[${index}][direction]`, entry.direction ?? "desc");
    });
    return url.toString();
  }

  private async fetchAllPages<T>(
    tableId: string,
    mapper: (record: AirtableRecordRaw) => T,
    opts: FetchOpts = {}
  ): Promise<T[]> {
    const results: T[] = [];
    let offset: string | undefined;

    do {
      const baseUrl = this.buildUrl(tableId, opts);
      const url = offset ? `${baseUrl}&offset=${encodeURIComponent(offset)}` : baseUrl;
      const data = await this.request<AirtableListResponse>(url, opts.cacheTags);
      results.push(...data.records.map(mapper));
      offset = data.offset;
      if (results.length >= MAX_RECORDS) {
        return results.slice(0, MAX_RECORDS);
      }
    } while (offset);

    return results;
  }

  private cacheTagsForRange(dateRange?: DateRange): string[] {
    if (dateRange) {
      return [`airtable-criteo-ads-${dateRange.from}-${dateRange.to}`];
    }
    return ["airtable-criteo-ads"];
  }

  async getDailyAnalytics(limit?: number, dateRange?: DateRange): Promise<CriteoDailyRow[]> {
    const dateFilter = dateRange ? criteoAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.fetchAllPages(this.dailyTableId, mapDailyRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Day", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  async getOverallAnalytics(): Promise<CriteoOverallRow | null> {
    const rows = await this.fetchAllPages(this.overallTableId, mapOverallRecord, {
      maxRecords: 1,
      cacheTags: ["airtable-criteo-ads-overall"]
    });
    return rows[0] ?? null;
  }
}

let client: CriteoAdsClient | null = null;

export function getCriteoAdsClient(): CriteoAdsClient {
  if (!client) {
    client = new CriteoAdsClient(getCriteoAdsEnv());
  }
  return client;
}

export const criteoAds = {
  getDailyAnalytics: (limit?: number, dateRange?: DateRange) =>
    getCriteoAdsClient().getDailyAnalytics(limit, dateRange),
  getOverallAnalytics: () => getCriteoAdsClient().getOverallAnalytics()
};
