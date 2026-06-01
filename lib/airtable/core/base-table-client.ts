import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { AirtableAPIError } from "@/lib/airtable/errors";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";

const DEFAULT_REVALIDATE_SECONDS = 300;
const DEFAULT_MAX_RECORDS = 2000;
const REQUEST_TIMEOUT_MS = 30_000;

export type RecordFetchOpts = {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  maxRecords?: number;
  cacheTags?: string[];
  noCache?: boolean;
};

type BaseTableClientOptions = {
  baseName: string;
  defaultCacheTag: string;
  revalidateSeconds?: number;
  maxRecords?: number;
};

export class AirtableBaseTableClient {
  private readonly apiKey: string;
  private readonly baseName: string;
  private readonly defaultCacheTag: string;
  private readonly revalidateSeconds: number;
  private readonly maxRecords: number;
  private baseIdPromise: Promise<string> | null = null;

  constructor(options: BaseTableClientOptions) {
    this.apiKey = getAirtableApiKey();
    this.baseName = options.baseName;
    this.defaultCacheTag = options.defaultCacheTag;
    this.revalidateSeconds = options.revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS;
    this.maxRecords = options.maxRecords ?? DEFAULT_MAX_RECORDS;
  }

  private getBaseId(): Promise<string> {
    if (!this.baseIdPromise) {
      this.baseIdPromise = resolveBaseId(this.baseName);
    }
    return this.baseIdPromise;
  }

  private async request<T>(url: string, opts: { cacheTags?: string[]; noCache?: boolean } = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json"
        },
        ...(opts.noCache
          ? { cache: "no-store" as const }
          : {
              next: {
                revalidate: this.revalidateSeconds,
                tags: opts.cacheTags ?? [this.defaultCacheTag]
              }
            })
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

  private async buildUrl(tableName: string, opts: RecordFetchOpts = {}): Promise<string> {
    const baseId = await this.getBaseId();
    const url = new URL(tableRecordsPath(baseId, tableName));

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

  async fetchAllPages<T>(
    tableName: string,
    mapper: (record: { id: string; fields: Record<string, unknown> }) => T,
    opts: RecordFetchOpts = {}
  ): Promise<T[]> {
    const results: T[] = [];
    let offset: string | undefined;

    do {
      const baseUrl = await this.buildUrl(tableName, opts);
      const url = offset ? `${baseUrl}&offset=${encodeURIComponent(offset)}` : baseUrl;
      const data = await this.request<{ records: Array<{ id: string; fields: Record<string, unknown> }>; offset?: string }>(
        url,
        { cacheTags: opts.cacheTags, noCache: opts.noCache }
      );
      results.push(...data.records.map(mapper));
      offset = data.offset;
      if (results.length >= this.maxRecords) {
        return results.slice(0, this.maxRecords);
      }
    } while (offset);

    return results;
  }

  async getRecord<T>(
    tableName: string,
    recordId: string,
    mapper: (record: { id: string; fields: Record<string, unknown> }) => T
  ): Promise<T | null> {
    const baseId = await this.getBaseId();
    const url = `${tableRecordsPath(baseId, tableName)}/${recordId}`;

    try {
      const raw = await this.request<{ id: string; fields: Record<string, unknown> }>(url, { noCache: true });
      return mapper(raw);
    } catch (error) {
      if (error instanceof AirtableAPIError && error.status === 404) return null;
      throw error;
    }
  }

  async patchRecord(
    tableName: string,
    recordId: string,
    fields: Record<string, unknown>
  ): Promise<{ id: string; fields: Record<string, unknown> }> {
    const baseId = await this.getBaseId();
    const url = `${tableRecordsPath(baseId, tableName)}/${recordId}`;
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

      return (await response.json()) as { id: string; fields: Record<string, unknown> };
    } catch (error) {
      if (error instanceof AirtableAPIError) throw error;
      throw new AirtableAPIError("Airtable patch timed out", 408, url);
    } finally {
      clearTimeout(timeout);
    }
  }

  async deleteRecord(tableName: string, recordId: string): Promise<void> {
    const baseId = await this.getBaseId();
    const url = `${tableRecordsPath(baseId, tableName)}/${recordId}`;
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
}
