import { getSEOAnalyticsEnv } from "@/lib/seo-analytics/env";
import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import {
  mapGA4PageRecord,
  mapGA4SourceRecord,
  mapSEOTrackingRecord
} from "@/lib/airtable/map";
import {
  BLOG_PIPELINE_TABLE,
  mapBlogPipelineRecord,
  type BlogPipelineRow,
  type BlogStatus
} from "@/lib/airtable/blog-pipeline";
import type {
  AirtableListResponse,
  AirtableRecordRaw,
  ActionStatus,
  ChannelBreakdownRow,
  GA4PageRow,
  GA4SourceRow,
  SEOTrackingRow
} from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
import { combineFormulas, endDateInRangeFormula } from "@/lib/date-range/airtable-filter";

const REVALIDATE_SECONDS = 300;
const MAX_RECORDS = 1000;
const REQUEST_TIMEOUT_MS = 30_000;

type FetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  maxRecords?: number;
  cacheTags?: string[];
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
          tags: cacheTags ?? ["airtable-seo"]
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
      return [`airtable-seo-${dateRange.from}-${dateRange.to}`];
    }
    return ["airtable-seo"];
  }

  async getSEOKeywords(opts?: {
    limit?: number;
    filter?: string;
    dateRange?: DateRange;
  }): Promise<SEOTrackingRow[]> {
    const dateFilter = opts?.dateRange ? endDateInRangeFormula(opts.dateRange) : undefined;
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_SEO_TRACKING_TABLE_ID,
      mapSEOTrackingRecord,
      {
        filterByFormula: combineFormulas(opts?.filter, dateFilter),
        sort: [{ field: "Clicks", direction: "desc" }],
        cacheTags: this.cacheTagsForRange(opts?.dateRange)
      }
    );
    return opts?.limit ? rows.slice(0, opts.limit) : rows;
  }

  private async patchRecord(
    tableId: string,
    recordId: string,
    fields: Record<string, unknown>
  ): Promise<AirtableRecordRaw> {
    const url = `${tableRecordsPath(this.baseId, tableId)}/${recordId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "PATCH",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields }),
        cache: "no-store"
      });

      if (!response.ok) {
        const message = await response.text();
        throw new AirtableAPIError(message || "Airtable patch failed", response.status, url);
      }

      return (await response.json()) as AirtableRecordRaw;
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Airtable patch timed out", 408, url);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async deleteRecord(tableId: string, recordId: string): Promise<void> {
    const url = `${tableRecordsPath(this.baseId, tableId)}/${recordId}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      cache: "no-store"
    });
    if (!response.ok) {
      const message = await response.text();
      throw new AirtableAPIError(message || "Airtable delete failed", response.status, url);
    }
  }

  async updateActionStatus(recordId: string, status: ActionStatus): Promise<SEOTrackingRow> {
    const raw = await this.patchRecord(this.tables.AIRTABLE_SEO_TRACKING_TABLE_ID, recordId, {
      "Action Status": status
    });
    return mapSEOTrackingRecord(raw);
  }

  async getBlogPipeline(opts?: {
    status?: BlogStatus | BlogStatus[];
    limit?: number;
  }): Promise<BlogPipelineRow[]> {
    let filter: string | undefined;
    if (opts?.status) {
      const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
      const parts = statuses.map((s) => `{Blog Status} = "${s}"`);
      filter = statuses.length === 1 ? parts[0] : `OR(${parts.join(",")})`;
    }

    const rows = await this.fetchAllPages(BLOG_PIPELINE_TABLE, mapBlogPipelineRecord, {
      filterByFormula: filter,
      sort: [{ field: "Last Modified", direction: "desc" }]
    });

    return opts?.limit ? rows.slice(0, opts.limit) : rows;
  }

  async getBlogTopicById(recordId: string): Promise<BlogPipelineRow | null> {
    const url = `${tableRecordsPath(this.baseId, BLOG_PIPELINE_TABLE)}/${recordId}`;
    try {
      const raw = await this.request<AirtableRecordRaw>(url);
      return mapBlogPipelineRecord(raw);
    } catch (error) {
      if (error instanceof AirtableAPIError && error.status === 404) return null;
      throw error;
    }
  }

  async updateBlogTopic(recordId: string, fields: Record<string, unknown>): Promise<BlogPipelineRow> {
    const raw = await this.patchRecord(BLOG_PIPELINE_TABLE, recordId, fields);
    return mapBlogPipelineRecord(raw);
  }

  async deleteBlogTopic(recordId: string): Promise<void> {
    await this.deleteRecord(BLOG_PIPELINE_TABLE, recordId);
  }

  async getCriticalKeywords(dateRange?: DateRange): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({ filter: '{SEO Priority} = "Critical"', dateRange });
  }

  async getCriticalKeywordsPending(dateRange?: DateRange): Promise<SEOTrackingRow[]> {
    const rows = await this.getCriticalKeywords(dateRange);
    return rows.filter((r) => r.actionStatus !== "Done" && r.actionStatus !== "Ignored");
  }

  async getHighBouncePages(dateRange?: DateRange): Promise<GA4PageRow[]> {
    const rows = await this.getTopPagesBySessions(undefined, dateRange);
    return rows
      .filter((row) => row.bounceRatePct > 60 && row.sessions > 200)
      .sort((a, b) => b.sessions - a.sessions);
  }

  async getLowCTRKeywords(dateRange?: DateRange): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({
      filter: '{SEO Opportunity Type} = "High Impressions Low CTR"',
      dateRange
    });
  }

  async getPage2Opportunities(dateRange?: DateRange): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({
      filter: '{SEO Opportunity Type} = "Page 2 Ranking Opportunity"',
      dateRange
    });
  }

  async getZeroClickKeywords(dateRange?: DateRange): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({
      filter: '{SEO Opportunity Type} = "Zero Click Opportunity"',
      dateRange
    });
  }

  async getTopPagesBySessions(limit = 50, dateRange?: DateRange): Promise<GA4PageRow[]> {
    const dateFilter = dateRange ? endDateInRangeFormula(dateRange) : undefined;
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GA4_PAGE_PERFORMANCE_TABLE_ID,
      mapGA4PageRecord,
      {
        filterByFormula: dateFilter,
        sort: [{ field: "Sessions", direction: "desc" }],
        cacheTags: this.cacheTagsForRange(dateRange)
      }
    );
    return rows.slice(0, limit);
  }

  async getHighEngagementPages(dateRange?: DateRange): Promise<GA4PageRow[]> {
    const rows = await this.getTopPagesBySessions(MAX_RECORDS, dateRange);
    return rows
      .filter((row) => row.engagementRatePct > 60 && row.sessions > 100)
      .sort((a, b) => b.engagementRatePct - a.engagementRatePct);
  }

  async getPoorPerformancePages(dateRange?: DateRange): Promise<GA4PageRow[]> {
    const rows = await this.getTopPagesBySessions(MAX_RECORDS, dateRange);
    return rows
      .filter((row) => row.bounceRate > 0.6 && row.sessions > 50)
      .sort((a, b) => b.sessions - a.sessions);
  }

  async getTrafficSources(limit = 50, dateRange?: DateRange): Promise<GA4SourceRow[]> {
    const dateFilter = dateRange ? endDateInRangeFormula(dateRange) : undefined;
    const rows = await this.fetchAllPages(
      this.tables.AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID,
      mapGA4SourceRecord,
      {
        filterByFormula: dateFilter,
        sort: [{ field: "Sessions", direction: "desc" }],
        cacheTags: this.cacheTagsForRange(dateRange)
      }
    );
    return rows.slice(0, limit);
  }

  async getChannelBreakdown(dateRange?: DateRange): Promise<ChannelBreakdownRow[]> {
    const dateFilter = dateRange ? endDateInRangeFormula(dateRange) : undefined;
    const sources = await this.fetchAllPages(
      this.tables.AIRTABLE_GA4_TRAFFIC_SOURCES_TABLE_ID,
      mapGA4SourceRecord,
      {
        filterByFormula: dateFilter,
        cacheTags: this.cacheTagsForRange(dateRange)
      }
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
  getCriticalKeywords: (...args: Parameters<AirtableClient["getCriticalKeywords"]>) =>
    getAirtableClient().getCriticalKeywords(...args),
  getCriticalKeywordsPending: (...args: Parameters<AirtableClient["getCriticalKeywordsPending"]>) =>
    getAirtableClient().getCriticalKeywordsPending(...args),
  getHighBouncePages: (...args: Parameters<AirtableClient["getHighBouncePages"]>) =>
    getAirtableClient().getHighBouncePages(...args),
  updateActionStatus: (...args: Parameters<AirtableClient["updateActionStatus"]>) =>
    getAirtableClient().updateActionStatus(...args),
  getBlogPipeline: (...args: Parameters<AirtableClient["getBlogPipeline"]>) =>
    getAirtableClient().getBlogPipeline(...args),
  getBlogTopicById: (...args: Parameters<AirtableClient["getBlogTopicById"]>) =>
    getAirtableClient().getBlogTopicById(...args),
  updateBlogTopic: (...args: Parameters<AirtableClient["updateBlogTopic"]>) =>
    getAirtableClient().updateBlogTopic(...args),
  deleteBlogTopic: (...args: Parameters<AirtableClient["deleteBlogTopic"]>) =>
    getAirtableClient().deleteBlogTopic(...args),
  getLowCTRKeywords: (...args: Parameters<AirtableClient["getLowCTRKeywords"]>) =>
    getAirtableClient().getLowCTRKeywords(...args),
  getPage2Opportunities: (...args: Parameters<AirtableClient["getPage2Opportunities"]>) =>
    getAirtableClient().getPage2Opportunities(...args),
  getZeroClickKeywords: (...args: Parameters<AirtableClient["getZeroClickKeywords"]>) =>
    getAirtableClient().getZeroClickKeywords(...args),
  getTopPagesBySessions: (...args: Parameters<AirtableClient["getTopPagesBySessions"]>) =>
    getAirtableClient().getTopPagesBySessions(...args),
  getHighEngagementPages: (...args: Parameters<AirtableClient["getHighEngagementPages"]>) =>
    getAirtableClient().getHighEngagementPages(...args),
  getPoorPerformancePages: (...args: Parameters<AirtableClient["getPoorPerformancePages"]>) =>
    getAirtableClient().getPoorPerformancePages(...args),
  getTrafficSources: (...args: Parameters<AirtableClient["getTrafficSources"]>) =>
    getAirtableClient().getTrafficSources(...args),
  getChannelBreakdown: (...args: Parameters<AirtableClient["getChannelBreakdown"]>) =>
    getAirtableClient().getChannelBreakdown(...args)
};

/** Spec alias */
export const seoAirtable = airtable;
