import type { DateRange } from "@/lib/date-range/types";

export interface SEOIntelligence {
  summary: {
    totalKeywords: number;
    avgPosition: number;
    avgCTR: number;
    totalImpressions: number;
    totalClicks: number;
  };
  page2Opportunities: Array<{
    keyword: string;
    position: number;
    impressions: number;
    clicks: number;
    ctr: number;
    pageUrl?: string;
    brandType?: string;
    opportunityType?: string;
    recommendedAction?: string;
  }>;
  lowCTRKeywords: Array<{
    keyword: string;
    position: number;
    impressions: number;
    ctr: number;
    pageUrl?: string;
  }>;
  topPerformers: Array<{
    keyword: string;
    position: number;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  newKeywords: Array<{
    keyword: string;
    position: number;
    impressions: number;
    status: string;
    opportunityType?: string;
    suggestedContentType?: string;
  }>;
  topPages: Array<{
    pagePath: string;
    pageTitle: string;
    sessions: number;
    bounceRate: number;
    engagementRate: number;
  }>;
  worstBouncePages: Array<{
    pagePath: string;
    pageTitle: string;
    sessions: number;
    bounceRate: number;
  }>;
}

export interface AEOIntelligence {
  summary: {
    brandMentionRate: number;
    totalCitations: number;
    totalResponses: number;
    neutralSharePct: number;
    competitorMentions: number;
    strongestPlatform: string;
    weakestPlatform: string;
  };
  llmBreakdown: Array<{
    name: string;
    citationsCount: number;
    brandCitationPct: number;
    competitorCitationPct: number;
    brandMentionPct: number;
    competitorMentionPct: number;
  }>;
  zeroPresencePrompts: Array<{
    promptId: string;
    text: string;
    topic: string;
    buyerPersona: string;
    competitorMentionPct: number;
    neitherPct: number;
  }>;
  competitorDominatedPrompts: Array<{
    promptId: string;
    text: string;
    topic: string;
    competitorMentionPct: number;
    brandMentionPct: number;
  }>;
  brandStrongPrompts: Array<{
    promptId: string;
    text: string;
    brandMentionPct: number;
  }>;
  competitors: Array<{
    name: string;
    domain: string;
  }>;
  /** All Cairrot prompt topics — used for SEO/AEO overlap detection */
  allTopics: string[];
  lastRunAt: string;
  runId: string;
  providers: string[];
}

export interface GEOIntelligence {
  overallScore: number;
  lastUpdated: string;
  categories: Array<{
    name: string;
    score: number;
    issues: number;
  }>;
  weakCategories: Array<{
    name: string;
    score: number;
  }>;
  strongCategories: Array<{
    name: string;
    score: number;
  }>;
}

export type GapPriority = "critical" | "high" | "medium";

export interface ActionableGaps {
  seoAeoOverlap: Array<{
    seoKeyword: string;
    position: number;
    impressions: number;
    clicks?: number;
    ctr?: number;
    pageUrl?: string | null;
    relatedAeoPrompt: string;
    aeoTopic: string;
    buyerPersona?: string | null;
    priority: GapPriority;
  }>;
  contentGaps: Array<{
    prompt: string;
    topic: string;
    buyerPersona: string;
    competitorPresence: number;
    suggestedAction: string;
    priority: GapPriority;
  }>;
  technicalGaps: Array<{
    category: string;
    score: number;
    suggestedAction: string;
    priority: GapPriority;
  }>;
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
}

export interface CombinedIntelligenceReport {
  generatedAt: string;
  source: string;
  dateRange: {
    days: number;
    from: string;
    to: string;
  };
  seo: SEOIntelligence | null;
  aeo: AEOIntelligence | null;
  geo: GEOIntelligence | null;
  actionableGaps: ActionableGaps;
  errors: Array<{ source: "seo" | "aeo" | "geo"; message: string }>;
}

export interface BuildReportOptions {
  dateRange: DateRange;
  runId?: string;
}

export interface IntelligenceGapSummary {
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  totalGaps: number;
}
