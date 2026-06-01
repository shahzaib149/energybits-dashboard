import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { AirtableBaseTableClient } from "@/lib/airtable/core/base-table-client";
import {
  mapAdGroupRecord,
  mapCampaignRecord,
  mapCreativeRecord,
  mapKeywordRecord
} from "@/lib/google-ads/map";
import type {
  GoogleAdsAdGroupRow,
  GoogleAdsCampaignRow,
  GoogleAdsCreativeRow,
  GoogleAdsKeywordRow
} from "@/lib/google-ads/types";
import type { DateRange } from "@/lib/date-range/types";
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
  getKeywords: (...args: Parameters<GoogleAdsClient["getKeywords"]>) => getGoogleAdsClient().getKeywords(...args)
};
