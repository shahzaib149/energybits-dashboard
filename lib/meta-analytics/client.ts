import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import { metaCampaignDateInRangeFormula, metaAdInsightsDateInRangeFormula } from "@/lib/date-range/airtable-filter";
import type { DateRange } from "@/lib/date-range/types";
import { getMetaAnalyticsEnv } from "@/lib/meta-analytics/env";
import { mapMetaAdInsightRecord, mapMetaCampaignRecord } from "@/lib/meta-analytics/map";
import type {
  AirtableListResponse,
  AirtableRecordRaw,
  MetaAdInsightRow,
  MetaCampaignRow
} from "@/lib/meta-analytics/types";

const REVALIDATE_SECONDS = 300;
const MAX_RECORDS = 2000;
const REQUEST_TIMEOUT_MS = 30_000;

type FetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  cacheTags?: string[];
};

export class MetaAnalyticsClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly campaignTableId: string;
  private readonly adInsightsTableId: string;

  constructor(env: ReturnType<typeof getMetaAnalyticsEnv>) {
    this.apiKey = env.AIRTABLE_API_KEY;
    this.baseId = env.AIRTABLE_META_BASE_ID;
    this.campaignTableId = env.AIRTABLE_META_CAMPAIGN_TABLE_ID;
    this.adInsightsTableId = env.AIRTABLE_META_AD_INSIGHTS_TABLE_ID;
  }

  private async request<T>(url: string, cacheTags?: string[]): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${this.apiKey}`, Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS, tags: cacheTags ?? ["airtable-meta"] }
      });
      if (!response.ok) {
        throw new AirtableAPIError(await response.text(), response.status, url);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Meta Analytics Airtable request timed out", 408, url);
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

  private async fetchAllPages<T>(
    tableId: string,
    mapper: (record: AirtableRecordRaw) => T,
    opts: FetchOpts
  ): Promise<T[]> {
    const results: T[] = [];
    let offset: string | undefined;
    do {
      const baseUrl = this.buildUrl(tableId, opts);
      const url = offset ? `${baseUrl}&offset=${encodeURIComponent(offset)}` : baseUrl;
      const data = await this.request<AirtableListResponse>(url, opts.cacheTags);
      results.push(...data.records.map(mapper));
      offset = data.offset;
      if (results.length >= MAX_RECORDS) return results.slice(0, MAX_RECORDS);
    } while (offset);
    return results;
  }

  async getCampaigns(limit?: number, dateRange?: DateRange): Promise<MetaCampaignRow[]> {
    const rows = await this.fetchAllPages(this.campaignTableId, mapMetaCampaignRecord, {
      filterByFormula: dateRange ? metaCampaignDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "Date Start", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-meta-campaigns-${dateRange.from}-${dateRange.to}`] : ["airtable-meta-campaigns"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  async getAdInsights(limit?: number, dateRange?: DateRange): Promise<MetaAdInsightRow[]> {
    const rows = await this.fetchAllPages(this.adInsightsTableId, mapMetaAdInsightRecord, {
      filterByFormula: dateRange ? metaAdInsightsDateInRangeFormula(dateRange) : undefined,
      sort: [{ field: "date_start", direction: "desc" }],
      cacheTags: dateRange ? [`airtable-meta-ads-${dateRange.from}-${dateRange.to}`] : ["airtable-meta-ads"]
    });
    return limit ? rows.slice(0, limit) : rows;
  }
}

let client: MetaAnalyticsClient | null = null;

export function getMetaAnalyticsClient(): MetaAnalyticsClient {
  if (!client) client = new MetaAnalyticsClient(getMetaAnalyticsEnv());
  return client;
}

export const metaAnalytics = {
  getCampaigns: (limit?: number, dateRange?: DateRange) =>
    getMetaAnalyticsClient().getCampaigns(limit, dateRange),
  getAdInsights: (limit?: number, dateRange?: DateRange) =>
    getMetaAnalyticsClient().getAdInsights(limit, dateRange)
};
