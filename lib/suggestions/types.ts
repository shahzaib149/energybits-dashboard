export type SuggestionSeverity = "critical" | "warning" | "good" | "info";
export type SuggestionSource = "rules" | "ai" | "native";

export interface AdSuggestion {
  id: string;
  severity: SuggestionSeverity;
  /** Imperative command, ≤6 words, starts with a verb */
  action: string;
  /** The lever it moves: a ranking name, "CPM", "CPC", or a metric */
  affects: string;
  detail: string;
  source: SuggestionSource;
  /** Deep-link to platform UI — only set for native suggestions that support it */
  link?: string;
}

// ─── Meta context ────────────────────────────────────────────────────────────
// Derived from MetaAggregatedRow (spend/clicks/impressions/reach/ctrPct/cpc/
// cpm/frequency) + the raw MetaAdInsightRow (rankings, adLink).

export interface MetaAdContext {
  platform: "meta";
  adId: string;
  adName: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  ctrPct: number;
  cpc: number;
  cpm: number;
  frequency: number;
  recordCount: number;
  qualityRanking: string;
  engagementRateRanking: string;
  conversionRateRanking: string;
  adLink: string;
  // Conversion metrics
  purchases: number;
  purchaseValue: number;
  roas: number;
  formLeads: number;
  // Video funnel metrics (0 when not available)
  hookRate: number;
  thruPlayRate: number;
  /** Transcript / AI analysis of the ad video — enhances AI suggestions when present */
  adTranscript?: string;
  /** Average across all ads in the current period (for relative comparisons) */
  accountAverageCtrPct: number;
  accountAverageCpc: number;
  accountAverageFrequency: number;
  accountAverageRoas: number;
}

// ─── Google Ads context ───────────────────────────────────────────────────────
// Derived from GoogleAdsCreativeRow + campaign-level optimizationScore.

export interface GoogleAdContext {
  platform: "google";
  adId: string;
  adName: string;
  adType: string;
  campaignName: string;
  adGroupName: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctrPct: number;
  averageCpc: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
  conversionRatePct: number;
  roas: number;
  /** From GoogleAdsCampaignRow.optimizationScore — 0 means not available */
  optimizationScore: number;
  creativeTagSuggestions: string;
  /** Account-level averages computed from all creatives in the current period */
  accountAverageCtrPct: number;
  accountAverageRoas: number;
  accountAverageConversionRatePct: number;
}

export type AdContext = MetaAdContext | GoogleAdContext;

export interface SuggestionsResponse {
  suggestions: AdSuggestion[];
  cached: boolean;
  generatedAt: string;
}
