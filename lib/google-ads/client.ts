import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";
import {
  mapAdGroupRecord,
  mapCampaignRecord,
  mapCreativeRecord,
  mapKeywordRecord,
  mapPreviewRecord
} from "@/lib/google-ads/map";
import type {
  GoogleAdsAdGroupRow,
  GoogleAdsCampaignRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow,
  GoogleAdsPreviewRow
} from "@/lib/google-ads/types";
import type { DataBounds, DateRange } from "@/lib/date-range/types";
import { googleAdsDateInRangeFormula } from "@/lib/date-range/airtable-filter";

const { googleAds: GOOGLE_ADS } = AIRTABLE_BASES;

export class GoogleAdsClient {
  private readonly client: AirtableBaseTableClient;

  constructor() {
    this.client = new AirtableBaseTableClient({
      baseName: GOOGLE_ADS.name,
      defaultCacheTag: "airtable-google-ads",
      maxRecords: 1000
    });
  }

  private cacheTagsForRange(dateRange?: DateRange): string[] {
    if (dateRange) {
      return [`airtable-google-ads-${dateRange.from}-${dateRange.to}`];
    }
    return ["airtable-google-ads"];
  }

  async getCampaigns(limit?: number, dateRange?: DateRange): Promise<GoogleAdsCampaignRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.client.fetchAllPages(GOOGLE_ADS.tables.campaigns, mapCampaignRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Cost", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  async getAdGroups(limit?: number, dateRange?: DateRange): Promise<GoogleAdsAdGroupRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.client.fetchAllPages(GOOGLE_ADS.tables.adGroups, mapAdGroupRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Cost", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  /** Fetch all creative records for a single ad name (for the detail page). */
  async getCreativesByName(adName: string): Promise<GoogleAdsCreativeRow[]> {
    const escaped = adName.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return this.client.fetchAllPages(GOOGLE_ADS.tables.creatives, mapCreativeRecord, {
      filterByFormula: `{Ad Name} = "${escaped}"`,
      sort: [{ field: "Date", direction: "desc" }],
      noCache: true
    });
  }

  async getCreatives(limit?: number, dateRange?: DateRange): Promise<GoogleAdsCreativeRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.client.fetchAllPages(GOOGLE_ADS.tables.creatives, mapCreativeRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Clicks", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  async getKeywords(limit?: number, dateRange?: DateRange): Promise<GoogleAdsKeywordRow[]> {
    const dateFilter = dateRange ? googleAdsDateInRangeFormula(dateRange) : undefined;
    const rows = await this.client.fetchAllPages(GOOGLE_ADS.tables.keywords, mapKeywordRecord, {
      filterByFormula: dateFilter,
      sort: [{ field: "Cost", direction: "desc" }],
      cacheTags: this.cacheTagsForRange(dateRange)
    });
    return limit ? rows.slice(0, limit) : rows;
  }

  /** Auto-discover the preview table, fetch all rows, match by adId or adName. */
  async getPreviewByAdId(adId: string, adName?: string): Promise<GoogleAdsPreviewRow | null> {
    try {
      // Try registered name first, then auto-discover via meta API
      const tableName = await this.resolvePreviewTableName();
      if (!tableName) {
        console.warn("[GoogleAds] No preview table found in base");
        return null;
      }

      const all = await this.client.fetchAllPages(tableName, mapPreviewRecord, { noCache: true });

      if (all.length === 0) {
        console.warn(`[GoogleAds] Preview table "${tableName}" is empty`);
        return null;
      }

      // Match by adId exact, then adName fallback
      if (adId) {
        const byId = all.find(r => r.adId && r.adId.trim() === adId.trim());
        if (byId) return byId;
      }
      if (adName) {
        const byName = all.find(
          r => r.adName && r.adName.trim().toLowerCase() === adName.trim().toLowerCase()
        );
        if (byName) return byName;
      }

      console.warn(
        `[GoogleAds] No preview matched adId="${adId}" adName="${adName}". ` +
        `Records in table: ${all.length}. Sample adIds: ${all.slice(0, 5).map(r => r.adId || "(empty)").join(", ")}`
      );
      return null;
    } catch (err) {
      console.error("[GoogleAds] getPreviewByAdId failed:", err);
      return null;
    }
  }

  private async resolvePreviewTableName(): Promise<string | null> {
    // 1. Try the registered name first (fast path)
    try {
      const testRows = await this.client.fetchAllPages(
        GOOGLE_ADS.tables.adPreview,
        (r) => r.id,
        { maxRecords: 1, noCache: true }
      );
      if (testRows.length >= 0) return GOOGLE_ADS.tables.adPreview;
    } catch {
      // Registered name failed — scan all tables
    }

    // 2. Scan the base for any table with "preview" in the name
    try {
      const apiKey = getAirtableApiKey();
      const baseId = await resolveBaseId(GOOGLE_ADS.name);
      const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store"
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { tables: Array<{ name: string }> };
      const found = data.tables.find(t => t.name.toLowerCase().includes("preview"));
      if (found) {
        console.log(`[GoogleAds] Auto-discovered preview table: "${found.name}"`);
        return found.name;
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Returns the actual date range covered by the data in Airtable.
   * Always fetches fresh (noCache) so the bounds reflect the latest sync.
   * Returns null if the table is empty or unreachable.
   */
  async getDataBounds(): Promise<DataBounds | null> {
    try {
      const [oldest, newest] = await Promise.all([
        this.client.fetchAllPages(GOOGLE_ADS.tables.campaigns, mapCampaignRecord, {
          filterByFormula: 'NOT({Date} = "")',
          sort: [{ field: "Date", direction: "asc" }],
          maxRecords: 1,
          cacheTags: ["airtable-google-ads-bounds"]
        }),
        this.client.fetchAllPages(GOOGLE_ADS.tables.campaigns, mapCampaignRecord, {
          filterByFormula: 'NOT({Date} = "")',
          sort: [{ field: "Date", direction: "desc" }],
          maxRecords: 1,
          cacheTags: ["airtable-google-ads-bounds"]
        })
      ]);
      const minDate = oldest[0]?.date;
      const maxDate = newest[0]?.date;
      if (!minDate || !maxDate) return null;
      return { minDate, maxDate };
    } catch {
      return null;
    }
  }
}

let singleton: GoogleAdsClient | null = null;

export function getGoogleAdsClient(): GoogleAdsClient {
  if (!singleton) {
    singleton = new GoogleAdsClient();
  }
  return singleton;
}

export const googleAds = {
  getCampaigns: (...args: Parameters<GoogleAdsClient["getCampaigns"]>) => getGoogleAdsClient().getCampaigns(...args),
  getAdGroups: (...args: Parameters<GoogleAdsClient["getAdGroups"]>) => getGoogleAdsClient().getAdGroups(...args),
  getCreatives: (...args: Parameters<GoogleAdsClient["getCreatives"]>) => getGoogleAdsClient().getCreatives(...args),
  getCreativesByName: (adName: string) => getGoogleAdsClient().getCreativesByName(adName),
  getKeywords: (...args: Parameters<GoogleAdsClient["getKeywords"]>) => getGoogleAdsClient().getKeywords(...args),
  getDataBounds: () => getGoogleAdsClient().getDataBounds(),
  getPreviewByAdId: (adId: string, adName?: string) => getGoogleAdsClient().getPreviewByAdId(adId, adName)
};
