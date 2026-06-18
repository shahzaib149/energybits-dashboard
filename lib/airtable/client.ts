import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import {
  mapGA4PageRecord,
  mapGA4SourceRecord,
  mapSEOTrackingRecord
} from "@/lib/airtable/map";
import {
  mapBlogPipelineRecord,
  type BlogPipelineRow,
  type BlogStatus
} from "@/lib/airtable/blog-pipeline";
import type {
  ActionStatus,
  ChannelBreakdownRow,
  GA4PageRow,
  GA4SourceRow,
  SEOTrackingRow
} from "@/lib/airtable/types";
import type { DataBounds, DateRange } from "@/lib/date-range/types";
import { combineFormulas, endDateInRangeFormula } from "@/lib/date-range/airtable-filter";
import { mapBlogKeyword, mapAEOPrompt } from "@/lib/blog-pipeline/submit-types";
import type { BlogKeyword, AEOPrompt } from "@/lib/blog-pipeline/submit-types";

const MAX_RECORDS = 1000;
const { seo: SEO } = AIRTABLE_BASES;

export class AirtableClient {
  private readonly client: AirtableBaseTableClient;

  constructor() {
    this.client = new AirtableBaseTableClient({
      baseName: SEO.name,
      defaultCacheTag: "airtable-seo",
      maxRecords: MAX_RECORDS
    });
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
  }): Promise<SEOTrackingRow[]> {
    // Fetch all rows — no date filter (SEO Tracking is a cumulative snapshot table)
    const allRows = await this.client.fetchAllPages(SEO.tables.seoTracking, mapSEOTrackingRecord, {
      filterByFormula: opts?.filter,
      sort: [{ field: "Clicks", direction: "desc" }],
      cacheTags: ["airtable-seo-keywords"]
    });

    if (allRows.length === 0) return [];

    // Find the most recent End Date present in the data (in-memory, no extra API call)
    const latestEndDate = allRows.reduce<string>((max, r) => {
      return r.endDate && r.endDate > max ? r.endDate : max;
    }, "");

    let filtered: SEOTrackingRow[];
    if (latestEndDate) {
      // Keep only rows from the latest period + rows with no End Date (manual entries)
      filtered = allRows.filter((r) => r.endDate === latestEndDate || !r.endDate);
    } else {
      // No rows have an End Date at all — show everything
      filtered = allRows;
    }

    return opts?.limit ? filtered.slice(0, opts.limit) : filtered;
  }

  async updateActionStatus(recordId: string, status: ActionStatus): Promise<SEOTrackingRow> {
    const raw = await this.client.patchRecord(SEO.tables.seoTracking, recordId, {
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

    const rows = await this.client.fetchAllPages(SEO.tables.blogPipeline, mapBlogPipelineRecord, {
      filterByFormula: filter,
      sort: [
        { field: "Last Modified", direction: "desc" },
        { field: "Created Time", direction: "desc" }
      ],
      noCache: true,
      cacheTags: ["blog-pipeline"]
    });

    return opts?.limit ? rows.slice(0, opts.limit) : rows;
  }

  async getBlogTopicById(recordId: string): Promise<BlogPipelineRow | null> {
    return this.client.getRecord(SEO.tables.blogPipeline, recordId, mapBlogPipelineRecord);
  }

  async updateBlogTopic(recordId: string, fields: Record<string, unknown>): Promise<BlogPipelineRow> {
    const raw = await this.client.patchRecord(SEO.tables.blogPipeline, recordId, fields);
    return mapBlogPipelineRecord(raw);
  }

  async deleteBlogTopic(recordId: string): Promise<void> {
    await this.client.deleteRecord(SEO.tables.blogPipeline, recordId);
  }

  async createBlogTopic(fields: Record<string, unknown>): Promise<{ id: string; fields: Record<string, unknown> }> {
    return this.client.createRecord(SEO.tables.blogPipeline, fields);
  }

  async getKeywordsForBlog(): Promise<BlogKeyword[]> {
    return this.client.fetchAllPages(SEO.tables.keywords, mapBlogKeyword, { noCache: true });
  }

  async getAEOPromptsForBlog(): Promise<AEOPrompt[]> {
    return this.client.fetchAllPages(SEO.tables.aeoPromptOpportunities, mapAEOPrompt, { noCache: true });
  }

  async getCriticalKeywords(): Promise<SEOTrackingRow[]> {
    return this.getSEOKeywords({ filter: '{SEO Priority} = "Critical"' });
  }

  async getCriticalKeywordsPending(): Promise<SEOTrackingRow[]> {
    const rows = await this.getCriticalKeywords();
    return rows.filter((r) => r.actionStatus !== "Done" && r.actionStatus !== "Ignored");
  }

  async getHighBouncePages(dateRange?: DateRange): Promise<GA4PageRow[]> {
    const rows = await this.getTopPagesBySessions(undefined, dateRange);
    return rows
      .filter((row) => row.bounceRatePct > 60 && row.sessions > 200)
      .sort((a, b) => b.sessions - a.sessions);
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

  async getTopPagesBySessions(limit = 50, dateRange?: DateRange): Promise<GA4PageRow[]> {
    const dateFilter = dateRange ? endDateInRangeFormula(dateRange) : undefined;
    const allRows = await this.client.fetchAllPages(SEO.tables.ga4PagePerformance, mapGA4PageRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Sessions", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    // Deduplicate by pagePath — Make.com re-syncs create identical rows.
    // Keep the record with the most recent endDate (or highest sessions if tied).
    const seen = new Map<string, GA4PageRow>();
    for (const row of allRows) {
      const key = row.pagePath || row.id;
      const existing = seen.get(key);
      if (!existing ||
          row.endDate > existing.endDate ||
          (row.endDate === existing.endDate && row.sessions > existing.sessions)) {
        seen.set(key, row);
      }
    }
    return Array.from(seen.values())
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, limit);
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
    const allRows = await this.client.fetchAllPages(SEO.tables.ga4TrafficSources, mapGA4SourceRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Sessions", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    // Deduplicate by source+medium — same Make.com re-sync issue as pages
    const seen = new Map<string, GA4SourceRow>();
    for (const row of allRows) {
      const key = `${row.source}|${row.medium}|${row.channelGroup}`;
      const existing = seen.get(key);
      if (!existing ||
          row.endDate > existing.endDate ||
          (row.endDate === existing.endDate && row.sessions > existing.sessions)) {
        seen.set(key, row);
      }
    }
    return Array.from(seen.values())
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, limit);
  }

  async getChannelBreakdown(dateRange?: DateRange): Promise<ChannelBreakdownRow[]> {
    // Reuse deduplicated sources from getTrafficSources
    const sources = await this.getTrafficSources(MAX_RECORDS, dateRange);
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

  async getDataBounds(): Promise<DataBounds | null> {
    try {
      const [ga4Oldest, ga4Newest, seoNewest] = await Promise.all([
        this.client.fetchAllPages(SEO.tables.ga4PagePerformance, mapGA4PageRecord, {
          filterByFormula: 'NOT({End Date} = "")',
          sort: [{ field: "End Date", direction: "asc" }],
          maxRecords: 1,
          noCache: true
        }),
        this.client.fetchAllPages(SEO.tables.ga4PagePerformance, mapGA4PageRecord, {
          filterByFormula: 'NOT({End Date} = "")',
          sort: [{ field: "End Date", direction: "desc" }],
          maxRecords: 1,
          noCache: true
        }),
        // Also check SEO Tracking for its latest End Date
        this.client.fetchAllPages(SEO.tables.seoTracking, mapSEOTrackingRecord, {
          filterByFormula: 'NOT({End Date} = "")',
          sort: [{ field: "End Date", direction: "desc" }],
          maxRecords: 1,
          noCache: true
        })
      ]);

      const ga4Min = ga4Oldest[0]?.endDate ?? null;
      const ga4Max = ga4Newest[0]?.endDate ?? null;
      const seoMax = seoNewest[0]?.endDate ?? null;

      // Use the earliest of GA4 min as floor, latest of GA4/SEO as ceiling
      if (!ga4Min || !ga4Max) return null;
      const maxDate = seoMax && seoMax > ga4Max ? seoMax : ga4Max;
      return { minDate: ga4Min, maxDate };
    } catch {
      return null;
    }
  }
}

let singleton: AirtableClient | null = null;

export function getAirtableClient(): AirtableClient {
  if (!singleton) {
    singleton = new AirtableClient();
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
  createBlogTopic: (...args: Parameters<AirtableClient["createBlogTopic"]>) =>
    getAirtableClient().createBlogTopic(...args),
  getKeywordsForBlog: (...args: Parameters<AirtableClient["getKeywordsForBlog"]>) =>
    getAirtableClient().getKeywordsForBlog(...args),
  getAEOPromptsForBlog: (...args: Parameters<AirtableClient["getAEOPromptsForBlog"]>) =>
    getAirtableClient().getAEOPromptsForBlog(...args),
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
    getAirtableClient().getChannelBreakdown(...args),
  getDataBounds: () => getAirtableClient().getDataBounds()
};

/** Spec alias */
export const seoAirtable = airtable;
