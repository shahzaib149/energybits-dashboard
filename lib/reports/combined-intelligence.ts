import { airtable } from "@/lib/airtable/client";
import type { GA4PageRow, SEOTrackingRow } from "@/lib/airtable/types";
import { getCairrotClient } from "@/lib/cairrot/client";
import type { ProjectPrompt } from "@/lib/cairrot/project-dashboard";
import type { LLMBreakdown, PromptResult } from "@/lib/cairrot/types";
import { formatYYYYMMDD } from "@/lib/date-range/parse";
import type { DateRange } from "@/lib/date-range/types";
import { isCairrotConfigured } from "@/lib/env";
import { isSEOAnalyticsConfigured } from "@/lib/seo-analytics/env";
import { dedupeKeywordsByQuery, weightedAveragePosition } from "@/lib/seo-analytics/metrics";
import { computeAtAGlance } from "@/lib/utils/overview-display";
import type {
  ActionableGaps,
  AEOIntelligence,
  BuildReportOptions,
  CombinedIntelligenceReport,
  GapPriority,
  GEOIntelligence,
  IntelligenceGapSummary,
  SEOIntelligence
} from "@/lib/reports/types";

const REPORT_SOURCE = "ENERGYbits Combined Intelligence Report";

function todayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function subtractDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - days);
  return result;
}

export function dateRangeFromDays(days: number): DateRange {
  const today = todayLocal();
  const from = subtractDays(today, days);
  const preset = days === 7 ? "7d" : days === 28 ? "28d" : days === 90 ? "90d" : "custom";
  return {
    preset,
    from: formatYYYYMMDD(from),
    to: formatYYYYMMDD(today)
  };
}

export function daysInRange(range: DateRange): number {
  const from = new Date(`${range.from}T12:00:00`);
  const to = new Date(`${range.to}T12:00:00`);
  const diff = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

function normalizedCtr(row: SEOTrackingRow): number {
  if (row.ctr > 0 && row.ctr <= 1) return row.ctr;
  if (row.ctrPct > 0) return row.ctrPct / 100;
  if (row.impressions > 0) return row.clicks / row.impressions;
  return 0;
}

function mapPage2Row(row: SEOTrackingRow): SEOIntelligence["page2Opportunities"][number] {
  return {
    keyword: row.query,
    position: row.averagePosition,
    impressions: row.impressions,
    clicks: row.clicks,
    ctr: normalizedCtr(row),
    pageUrl: row.pageUrl || undefined,
    brandType: row.brandType,
    opportunityType: row.seoOpportunityType,
    recommendedAction: row.recommendedAction || undefined
  };
}

function mapTopPage(row: GA4PageRow): SEOIntelligence["topPages"][number] {
  return {
    pagePath: row.pagePath,
    pageTitle: row.pageTitle,
    sessions: row.sessions,
    bounceRate: row.bounceRate,
    engagementRate: row.engagementRate
  };
}

export async function fetchSEOIntelligence(dateRange: DateRange): Promise<SEOIntelligence> {
  const [keywords, pages] = await Promise.all([
    airtable.getSEOKeywords({ dateRange }),
    airtable.getTopPagesBySessions(1000, dateRange)
  ]);

  const deduped = dedupeKeywordsByQuery(keywords);
  const totalImpressions = deduped.reduce((sum, row) => sum + row.impressions, 0);
  const totalClicks = deduped.reduce((sum, row) => sum + row.clicks, 0);

  const page2Opportunities = deduped
    .filter((row) => row.averagePosition >= 8 && row.averagePosition <= 20 && row.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .map(mapPage2Row);

  const lowCTRKeywords = deduped
    .filter((row) => row.impressions >= 100 && normalizedCtr(row) < 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15)
    .map((row) => ({
      keyword: row.query,
      position: row.averagePosition,
      impressions: row.impressions,
      ctr: normalizedCtr(row),
      pageUrl: row.pageUrl || undefined
    }));

  const topPerformers = deduped
    .filter((row) => row.averagePosition <= 3)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)
    .map((row) => ({
      keyword: row.query,
      position: row.averagePosition,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: normalizedCtr(row)
    }));

  const newKeywords = deduped
    .filter((row) => row.status === "New")
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .map((row) => ({
      keyword: row.query,
      position: row.averagePosition,
      impressions: row.impressions,
      status: row.status,
      opportunityType: row.seoOpportunityType || undefined,
      suggestedContentType: row.suggestedContentType || undefined
    }));

  const topPages = pages
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10)
    .map(mapTopPage);

  const worstBouncePages = pages
    .filter((row) => row.sessions >= 10 && row.bounceRate > 0.6)
    .sort((a, b) => b.bounceRate - a.bounceRate)
    .slice(0, 10)
    .map((row) => ({
      pagePath: row.pagePath,
      pageTitle: row.pageTitle,
      sessions: row.sessions,
      bounceRate: row.bounceRate
    }));

  return {
    summary: {
      totalKeywords: deduped.length,
      avgPosition: weightedAveragePosition(deduped),
      avgCTR: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      totalImpressions,
      totalClicks
    },
    page2Opportunities,
    lowCTRKeywords,
    topPerformers,
    newKeywords,
    topPages,
    worstBouncePages
  };
}

function brandMentionPctFromShares(shares: PromptResult["responseShares"]): number {
  return shares.brandOnlyPct + shares.bothPct;
}

function competitorMentionPctFromShares(shares: PromptResult["responseShares"]): number {
  return shares.competitorOnlyPct + shares.bothPct;
}

function llmBrandMentionPct(llm: LLMBreakdown): number {
  return llm.responseShares.brandOnlyPct + llm.responseShares.bothPct;
}

function llmCompetitorMentionPct(llm: LLMBreakdown): number {
  return llm.responseShares.competitorOnlyPct + llm.responseShares.bothPct;
}

function promptMeta(
  promptId: string,
  allPrompts: ProjectPrompt[]
): { topic: string; buyerPersona: string } {
  const match = allPrompts.find((p) => p.id === promptId);
  return {
    topic: match?.topic ?? "General",
    buyerPersona: match?.buyerPersona ?? "Unknown"
  };
}

function pickStrongestPlatform(llms: LLMBreakdown[]): string {
  if (llms.length === 0) return "—";
  const sorted = [...llms].sort((a, b) => llmBrandMentionPct(b) - llmBrandMentionPct(a));
  return sorted[0]?.name ?? "—";
}

function pickWeakestPlatform(llms: LLMBreakdown[]): string {
  if (llms.length === 0) return "—";
  const sorted = [...llms].sort((a, b) => llmBrandMentionPct(a) - llmBrandMentionPct(b));
  return sorted[0]?.name ?? "—";
}

export function fetchAEOIntelligenceFromDashboard(
  dashboard: Awaited<ReturnType<ReturnType<typeof getCairrotClient>["getFullDashboard"]>>
): AEOIntelligence {
  const { project, run, runs, allPrompts } = dashboard;

  const atAGlance = computeAtAGlance(run);
  const runSummary = runs.find((r) => r.runId === run.runId);

  const zeroPresencePrompts = run.prompts
    .filter((p) => brandMentionPctFromShares(p.responseShares) === 0)
    .map((p) => {
      const meta = promptMeta(p.promptId, allPrompts);
      return {
        promptId: p.promptId,
        text: p.text,
        topic: meta.topic,
        buyerPersona: meta.buyerPersona,
        competitorMentionPct: competitorMentionPctFromShares(p.responseShares),
        neitherPct: p.responseShares.neitherPct
      };
    });

  const competitorDominatedPrompts = run.prompts
    .filter((p) => {
      const brand = brandMentionPctFromShares(p.responseShares);
      const competitor = competitorMentionPctFromShares(p.responseShares);
      return competitor > brand;
    })
    .map((p) => {
      const meta = promptMeta(p.promptId, allPrompts);
      return {
        promptId: p.promptId,
        text: p.text,
        topic: meta.topic,
        competitorMentionPct: competitorMentionPctFromShares(p.responseShares),
        brandMentionPct: brandMentionPctFromShares(p.responseShares)
      };
    });

  const brandStrongPrompts = run.prompts
    .filter((p) => brandMentionPctFromShares(p.responseShares) >= 30)
    .map((p) => ({
      promptId: p.promptId,
      text: p.text,
      brandMentionPct: brandMentionPctFromShares(p.responseShares)
    }));

  return {
    summary: {
      brandMentionRate: atAGlance.brandMentionPct,
      totalCitations: run.totals.citations,
      totalResponses: run.totals.responses,
      neutralSharePct: run.totals.neutralSharePct,
      competitorMentions: run.totals.competitorMentions,
      strongestPlatform: pickStrongestPlatform(run.llms),
      weakestPlatform: pickWeakestPlatform(run.llms)
    },
    llmBreakdown: run.llms.map((llm) => ({
      name: llm.name,
      citationsCount: llm.citationsCount,
      brandCitationPct: llm.citationShares.brandPct,
      competitorCitationPct: llm.citationShares.competitorPct,
      brandMentionPct: llmBrandMentionPct(llm),
      competitorMentionPct: llmCompetitorMentionPct(llm)
    })),
    zeroPresencePrompts,
    competitorDominatedPrompts,
    brandStrongPrompts,
    competitors: project.competitors.map((c) => ({
      name: c.name,
      domain: c.domain
    })),
    allTopics: [...new Set(allPrompts.map((p) => p.topic).filter(Boolean))],
    lastRunAt: project.lastRunAt ?? run.createdAt,
    runId: run.runId,
    providers: runSummary?.providers ?? []
  };
}

export function fetchGEOIntelligenceFromDashboard(
  dashboard: Awaited<ReturnType<ReturnType<typeof getCairrotClient>["getFullDashboard"]>>
): GEOIntelligence {
  const geo = dashboard.project.geo;

  return {
    overallScore: geo.overallScore,
    lastUpdated: geo.lastUpdated,
    categories: geo.categories.map((c) => ({
      name: c.name,
      score: c.score,
      issues: c.issues
    })),
    weakCategories: geo.categories
      .filter((c) => c.score < 70)
      .map((c) => ({ name: c.name, score: c.score })),
    strongCategories: geo.categories
      .filter((c) => c.score >= 80)
      .map((c) => ({ name: c.name, score: c.score }))
  };
}

export async function fetchAEOIntelligence(runId?: string): Promise<AEOIntelligence> {
  const client = getCairrotClient();
  const dashboard = await client.getFullDashboard(runId);
  return fetchAEOIntelligenceFromDashboard(dashboard);
}

export async function fetchGEOIntelligence(runId?: string): Promise<GEOIntelligence> {
  const client = getCairrotClient();
  const dashboard = await client.getFullDashboard(runId);
  return fetchGEOIntelligenceFromDashboard(dashboard);
}

const TOPIC_STOP_WORDS = new Set([
  "the",
  "for",
  "and",
  "what",
  "are",
  "best",
  "can",
  "you",
  "which",
  "should",
  "i",
  "a",
  "an",
  "in",
  "of",
  "to",
  "is",
  "it",
  "my",
  "or",
  "do",
  "how",
  "that",
  "this",
  "with",
  "based",
  "support",
  "natural",
  "health"
]);

function expandTopicWord(word: string, expanded: string[]): void {
  if (word === "energy") {
    expanded.push("energybits");
  }
  if (word === "recovery") {
    expanded.push("recoverybits", "recover");
  }
  if (word === "algae") {
    expanded.push("algaebits", "spirulina", "chlorella");
  }
  if (word === "gut") {
    expanded.push("digestive", "microbiome");
  }
  if (word === "detoxification") {
    expanded.push("detox", "cleanse");
  }
  if (word === "workout") {
    expanded.push("exercise", "athletic", "endurance");
  }
  if (word.includes("spirulina")) {
    expanded.push("spirulina");
  }
  if (word.includes("chlorella")) {
    expanded.push("chlorella");
  }
  if (word.includes("supplement")) {
    expanded.push("supplement", "supplements", "tablets", "bits");
  }
}

function buildTopicSignals(topics: string[]): Record<string, string[]> {
  const signals: Record<string, string[]> = {};

  for (const topic of topics) {
    const words = topic
      .toLowerCase()
      .split(/[\s,/]+/)
      .filter((w) => w.length > 2 && !TOPIC_STOP_WORDS.has(w));

    const expanded = [...words];
    for (const w of words) {
      expandTopicWord(w, expanded);
    }

    signals[topic] = [...new Set(expanded)];
  }

  return signals;
}

function overlapImpressionPriority(impressions: number): GapPriority {
  if (impressions > 500) return "critical";
  if (impressions > 100) return "high";
  return "medium";
}

function contentGapPriority(competitorPresence: number): GapPriority {
  if (competitorPresence > 40) return "critical";
  if (competitorPresence > 0) return "high";
  return "medium";
}

function technicalGapPriority(score: number): GapPriority {
  if (score < 50) return "critical";
  if (score < 65) return "high";
  return "medium";
}

interface OverlapSeoKeyword {
  keyword: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
  pageUrl?: string;
}

interface OverlapAeoPrompt {
  text: string;
  topic: string;
  buyerPersona: string;
}

function findSeoAeoOverlaps(
  seoKeywords: OverlapSeoKeyword[],
  aeoZeroPrompts: OverlapAeoPrompt[],
  topicSignals: Record<string, string[]>
): ActionableGaps["seoAeoOverlap"] {
  const overlaps: ActionableGaps["seoAeoOverlap"] = [];

  for (const prompt of aeoZeroPrompts) {
    const signals = topicSignals[prompt.topic] ?? [];

    for (const kw of seoKeywords) {
      const kwLower = kw.keyword.toLowerCase();
      const kwWords = kwLower.split(/[\s-]+/);

      const matchCount = signals.filter((signal) =>
        kwWords.some((w) => w.includes(signal) || signal.includes(w))
      ).length;

      const keywordInPrompt = kwLower.split(/\s+/).some(
        (w) => w.length > 3 && prompt.text.toLowerCase().includes(w)
      );

      if (matchCount >= 1 || keywordInPrompt) {
        overlaps.push({
          seoKeyword: kw.keyword,
          position: kw.position,
          impressions: kw.impressions,
          clicks: kw.clicks,
          ctr: kw.ctr,
          pageUrl: kw.pageUrl ?? null,
          relatedAeoPrompt: prompt.text,
          aeoTopic: prompt.topic,
          buyerPersona: prompt.buyerPersona || null,
          priority: overlapImpressionPriority(kw.impressions)
        });
        break;
      }
    }
  }

  return overlaps.sort((a, b) => b.impressions - a.impressions);
}

function technicalGapAction(category: string, score: number): string {
  const name = category.toLowerCase();
  if (name.includes("authority")) {
    return "Improve authority: add research citations, expert bios, and backlink outreach";
  }
  if (name.includes("technical")) {
    return "Fix technical SEO: check crawlability, structured data, page speed";
  }
  return `Focus GEO improvement on ${category}: score is ${score}/100`;
}

function contentGapAction(
  prompt: AEOIntelligence["zeroPresencePrompts"][number],
  competitorDominated: boolean
): string {
  if (competitorDominated) {
    return `Strengthen existing content with FAQ schema for: ${prompt.topic}`;
  }
  if (prompt.competitorMentionPct > 0) {
    return `Create comparison blog: ENERGYbits vs competitors for ${prompt.topic}`;
  }
  return `Create educational blog targeting: ${prompt.topic}`;
}

export function computeGaps(
  seo: SEOIntelligence | null,
  aeo: AEOIntelligence | null,
  geo: GEOIntelligence | null
): ActionableGaps {
  let seoAeoOverlap: ActionableGaps["seoAeoOverlap"] = [];

  if (seo && aeo) {
    const page2Keywords: OverlapSeoKeyword[] = seo.page2Opportunities.map((row) => ({
      keyword: row.keyword,
      position: row.position,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      pageUrl: row.pageUrl
    }));

    const topics =
      aeo.allTopics.length > 0
        ? aeo.allTopics
        : [...new Set(aeo.zeroPresencePrompts.map((p) => p.topic))];

    const topicSignals = buildTopicSignals(topics);

    seoAeoOverlap = findSeoAeoOverlaps(
      page2Keywords,
      aeo.zeroPresencePrompts.map((p) => ({
        text: p.text,
        topic: p.topic,
        buyerPersona: p.buyerPersona
      })),
      topicSignals
    );
  }

  const dominatedIds = new Set(
    (aeo?.competitorDominatedPrompts ?? []).map((p) => p.promptId)
  );

  const contentGaps =
    aeo?.zeroPresencePrompts.map((prompt) => ({
      prompt: prompt.text,
      topic: prompt.topic,
      buyerPersona: prompt.buyerPersona,
      competitorPresence: prompt.competitorMentionPct,
      suggestedAction: contentGapAction(prompt, dominatedIds.has(prompt.promptId)),
      priority: contentGapPriority(prompt.competitorMentionPct)
    })) ?? [];

  const technicalGaps =
    geo?.weakCategories.map((cat) => ({
      category: cat.name,
      score: cat.score,
      suggestedAction: technicalGapAction(cat.name, cat.score),
      priority: technicalGapPriority(cat.score)
    })) ?? [];

  const allGaps = [...seoAeoOverlap, ...contentGaps, ...technicalGaps];
  const criticalGaps = allGaps.filter((g) => g.priority === "critical").length;
  const highGaps = allGaps.filter((g) => g.priority === "high").length;
  const mediumGaps = allGaps.filter((g) => g.priority === "medium").length;

  return {
    seoAeoOverlap,
    contentGaps,
    technicalGaps,
    totalGaps: allGaps.length,
    criticalGaps,
    highGaps,
    mediumGaps
  };
}

export async function buildCombinedIntelligenceReport(
  options: BuildReportOptions
): Promise<CombinedIntelligenceReport> {
  const { dateRange, runId } = options;
  const errors: CombinedIntelligenceReport["errors"] = [];

  let seo: SEOIntelligence | null = null;
  let aeo: AEOIntelligence | null = null;
  let geo: GEOIntelligence | null = null;

  const tasks: Promise<void>[] = [];

  if (isSEOAnalyticsConfigured()) {
    tasks.push(
      fetchSEOIntelligence(dateRange).then((data) => {
        seo = data;
      }).catch((err: unknown) => {
        errors.push({
          source: "seo",
          message: err instanceof Error ? err.message : "SEO data fetch failed"
        });
      })
    );
  } else {
    errors.push({ source: "seo", message: "SEO Analytics not configured" });
  }

  if (isCairrotConfigured()) {
    tasks.push(
      getCairrotClient()
        .getFullDashboard(runId)
        .then((dashboard) => {
          aeo = fetchAEOIntelligenceFromDashboard(dashboard);
          geo = fetchGEOIntelligenceFromDashboard(dashboard);
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : "Cairrot data fetch failed";
          errors.push({ source: "aeo", message });
          errors.push({ source: "geo", message });
        })
    );
  } else {
    errors.push({ source: "aeo", message: "Cairrot not configured" });
    errors.push({ source: "geo", message: "Cairrot not configured" });
  }

  await Promise.all(tasks);

  const actionableGaps = computeGaps(seo, aeo, geo);

  return {
    generatedAt: new Date().toISOString(),
    source: REPORT_SOURCE,
    dateRange: {
      days: daysInRange(dateRange),
      from: dateRange.from,
      to: dateRange.to
    },
    seo,
    aeo,
    geo,
    actionableGaps,
    errors
  };
}

export function gapSummaryFromReport(report: CombinedIntelligenceReport): IntelligenceGapSummary {
  return {
    criticalGaps: report.actionableGaps.criticalGaps,
    highGaps: report.actionableGaps.highGaps,
    mediumGaps: report.actionableGaps.mediumGaps,
    totalGaps: report.actionableGaps.totalGaps
  };
}
