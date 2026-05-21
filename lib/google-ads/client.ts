import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import { getGoogleAdsEnv } from "@/lib/google-ads/env";
import {
  mapAdGroupRecord,
  mapCampaignRecord,
  mapCreativeRecord,
  mapKeywordRecord
} from "@/lib/google-ads/map";
import type {
  AirtableListResponse,
  AirtableRecordRaw,
  GoogleAdsAdGroupRow,
  GoogleAdsCampaignRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow
} from "@/lib/google-ads/types";
import type { DateRange } from "@/lib/date-range/types";
import { combineFormulas, googleAdsDateInRangeFormula } from "@/lib/date-range/airtable-filter";

const REVALIDATE_SECONDS = 300;
const MAX_RECORDS = 1000;
const REQUEST_TIMEOUT_MS = 30_000;

type FetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  maxRecords?: number;
  cacheTags?: string[];
};

export class GoogleAdsClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly tables: ReturnType<typeof getGoogleAdsEnv>;

  constructor(env: ReturnType<typeof getGoogleAdsEnv>) {
    this.apiKey = env.AIRTABLE_API_KEY;
    this.baseId = env.AIRTABLE_GOOGLE_ADS_BASE_ID;
    this.tables = env;
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
          tags: cacheTags ?? ["airtable-google-ads"]
        }
      });

      if (!response.ok) {
        const message = await response.text();
        throw new AirtableAPIError(message || "Google Ads Airtable request failed", response.status, url);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Google Ads Airtable request timed out", 408, url);
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
      return [`airtable-google-ads-${dateRange.from}-${dateRange.to}`];
    }
    return ["airtable-google-ads"];
  }

  async getCampaigns(limit?: number, dateRange?: DateRange): Promise<GoogleAdsCampaignRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GOOGLE_ADS_CAMPAIGNS_TABLE_ID,
      mapCampaignRecord,
      {
        filterByFormula: dateFilter,
        sort: [{ field: "Cost", direction: "desc" }],
        cacheTags: this.cacheTagsForRange(dateRange)
      }
    );
    return limit ? rows.slice(0, limit) : rows;
  }

  async getAdGroups(limit?: number, dateRange?: DateRange): Promise<GoogleAdsAdGroupRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GOOGLE_ADS_AD_GROUPS_TABLE_ID,
      mapAdGroupRecord,
      {
        filterByFormula: dateFilter,
        sort: [{ field: "Cost", direction: "desc" }],
        cacheTags: this.cacheTagsForRange(dateRange)
      }
    );
    return limit ? rows.slice(0, limit) : rows;
  }

  async getCreatives(limit?: number, dateRange?: DateRange): Promise<GoogleAdsCreativeRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GOOGLE_ADS_CREATIVES_TABLE_ID,
      mapCreativeRecord,
      {
        filterByFormula: dateFilter,
        sort: [{ field: "Clicks", direction: "desc" }],
        cacheTags: this.cacheTagsForRange(dateRange)
      }
    );
    return limit ? rows.slice(0, limit) : rows;
  }

  async getKeywords(limit?: number, dateRange?: DateRange): Promise<GoogleAdsKeywordRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GOOGLE_ADS_KEYWORDS_TABLE_ID,
      mapKeywordRecord,
      {
        filterByFormula: dateFilter,
        sort: [{ field: "Cost", direction: "desc" }],
        cacheTags: this.cacheTagsForRange(dateRange)
      }
    );
    return limit ? rows.slice(0, limit) : rows;
  }
}

let singleton: GoogleAdsClient | null = null;

export function getGoogleAdsClient(): GoogleAdsClient {
  if (!singleton) {
    singleton = new GoogleAdsClient(getGoogleAdsEnv());
  }
  return singleton;
}

export const googleAds = {
  getCampaigns: (...args: Parameters<GoogleAdsClient["getCampaigns"]>) => getGoogleAdsClient().getCampaigns(...args),
  getAdGroups: (...args: Parameters<GoogleAdsClient["getAdGroups"]>) => getGoogleAdsClient().getAdGroups(...args),
  getCreatives: (...args: Parameters<GoogleAdsClient["getCreatives"]>) => getGoogleAdsClient().getCreatives(...args),
  getKeywords: (...args: Parameters<GoogleAdsClient["getKeywords"]>) => getGoogleAdsClient().getKeywords(...args)
};
