import { getSEOAnalyticsEnv } from "@/lib/seo-analytics/env";
import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import {
  mapGA4PageRecord,
  mapGA4SourceRecord,
  mapSEOTrackingRecord
} from "@/lib/airtable/map";
import type {
  AirtableListResponse,
  AirtableRecordRaw,
  ChannelBreakdownRow,
  GA4PageRow,
  GA4SourceRow,
  SEOTrackingRow
} from "@/lib/airtable/types";

const REVALIDATE_SECONDS = 300;
const MAX_RECORDS = 1000;
const REQUEST_TIMEOUT_MS = 30_000;

type FetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  maxRecords?: number;
};

export class AirtableClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly tables: ReturnType<typeof getSEOAnalyticsEnv>;

  constructor(env: ReturnType<typeof getSEOAnalyticsEnv>) {
    this.apiKey = env.AIRTABLE_API_KEY;
    this.baseId = env.AIRTABLE_BASE_ID;
    this.tables = env;
  }

  private async request<T>(url: string): Promise<T> {
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
          tags: ["airtable-seo"]
        }
      });

      if (!response.ok) {
        const message = await response.text();
        throw new AirtableAPIError(message || "Airtable request failed", response.status, url);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Airtable request timed out", 408, url);
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
      const data = await this.request<AirtableListResponse>(url);
      results.push(...data.records.map(mapper));
      offset = data.offset;
      if (results.length >= MAX_RECORDS) {
        return results.slice(0, MAX_RECORDS);
      }
    } while (offset);

    return results;
  }

  async getSEOKeywords(opts?: { limit?: number; filter?: string }): Promise<SEOTrackingRow[]> {
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_SEO_TRACKING_TABLE_ID,
      mapSEOTrackingRecord,
      {
        filterByFormula: opts?.filter,
        sort: [{ field: "Clicks", direction: "desc" }]
      }
    );
    return opts?.limit ? rows.slice(0, opts.limit) : rows;
  }

  async getCriticalKeywords(): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({ filter: '{SEO Priority} = "Critical"' });
  }

  async getLowCTRKeywords(): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({ filter: '{SEO Opportunity Type} = "High Impressions Low CTR"' });
  }

  async getPage2Opportunities(): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({ filter: '{SEO Opportunity Type} = "Page 2 Ranking Opportunity"' });
  }

  async getZeroClickKeywords(): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({ filter: '{SEO Opportunity Type} = "Zero Click Opportunity"' });
  }

  async getTopPagesBySessions(limit = 50): Promise<GA4PageRow[]> {
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID,
      mapGA4PageRecord,
      { sort: [{ field: "Sessions", direction: "desc" }] }
    );
    return rows.slice(0, limit);
  }

  async getHighEngagementPages(): Promise<GA4PageRow[]> {
    const rows = await this.getTopPagesBySessions(MAX_RECORDS);
    return rows
      .filter((row) => row.engagementRatePct > 60 && row.sessions > 100)
      .sort((a, b) => b.engagementRatePct - a.engagementRatePct);
  }

  async getPoorPerformancePages(): Promise<GA4PageRow[]> {
    const rows = await this.getTopPagesBySessions(MAX_RECORDS);
    return rows
      .filter((row) => row.bounceRate > 0.6 && row.sessions > 50)
      .sort((a, b) => b.sessions - a.sessions);
  }

  async getTrafficSources(limit = 50): Promise<GA4SourceRow[]> {
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID,
      mapGA4SourceRecord,
      { sort: [{ field: "Sessions", direction: "desc" }] }
    );
    return rows.slice(0, limit);
  }

  async getChannelBreakdown(): Promise<ChannelBreakdownRow[]> {
    const sources = await this.fetchAllPages(
      this.tables.AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID,
      mapGA4SourceRecord
    );
    const byChannel = new Map<string, number>();
    for (const row of sources) {
      const channel = row.channelGroup || "Other";
      byChannel.set(channel, (byChannel.get(channel) ?? 0) + row.sessions);
    }
    const total = Array.from(byChannel.values()).reduce((sum, n) => sum + n, 0) || 1;
    return Array.from(byChannel.entries())
      .map(([channel, sessions]) => ({
        channel,
        sessions,
        pct: (sessions / total) * 100
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }
}

let singleton: AirtableClient | null = null;

export function getAirtableClient(): AirtableClient {
  if (!singleton) {
    singleton = new AirtableClient(getSEOAnalyticsEnv());
  }
  return singleton;
}

/** Convenience export matching spec naming. */
export const airtable = {
  getSEOKeywords: (...args: Parameters<AirtableClient["getSEOKeywords"]>) => getAirtableClient().getSEOKeywords(...args),
  getCriticalKeywords: () => getAirtableClient().getCriticalKeywords(),
  getLowCTRKeywords: () => getAirtableClient().getLowCTRKeywords(),
  getPage2Opportunities: () => getAirtableClient().getPage2Opportunities(),
  getZeroClickKeywords: () => getAirtableClient().getZeroClickKeywords(),
  getTopPagesBySessions: (...args: Parameters<AirtableClient["getTopPagesBySessions"]>) =>
    getAirtableClient().getTopPagesBySessions(...args),
  getHighEngagementPages: () => getAirtableClient().getHighEngagementPages(),
  getPoorPerformancePages: () => getAirtableClient().getPoorPerformancePages(),
  getTrafficSources: (...args: Parameters<AirtableClient["getTrafficSources"]>) =>
    getAirtableClient().getTrafficSources(...args),
  getChannelBreakdown: () => getAirtableClient().getChannelBreakdown()
};
