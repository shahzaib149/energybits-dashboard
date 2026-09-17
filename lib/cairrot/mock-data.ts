import type {
  AIReadinessScore,
  CompetitorData,
  Insight,
  LLMBreakdown,
  NeutralDomain,
  PromptResult,
  RunOverview,
  RunSummary
} from "@/lib/cairrot/types";
import type {
  CairrotDashboard,
  ProjectDashboard,
  ProjectPrompt
} from "@/lib/cairrot/project-dashboard";

export function createMockProjectDashboard(): ProjectDashboard {
  return {
    id: "6a06285ac1f55955b1909d75",
    url: "https://energybits.com",
    host: "energybits.com",
    description:
      "ENERGYbits provides 100% pure, non-GMO, organically grown spirulina and chlorella algae tablets for cellular energy, mitochondrial nutrition, athletic recovery, and overall wellness.",
    planCode: "Growth",
    keywords: [
      "spirulina tablets",
      "chlorella tablets",
      "energybits spirulina",
      "recoverybits chlorella",
      "algae superfood tablets",
      "mitochondrial nutrition",
      "catharine arnston algae"
    ],
    topics: [
      "Superfood Nutrition",
      "Cellular Energy & Mitochondria",
      "Athletic Recovery & Endurance",
      "Heavy Metal Detoxification",
      "Longevity & Fasting Support"
    ],
    competitors: [
      { name: "Athletic Greens (AG1)", domain: "drinkag1.com" },
      { name: "NOW Foods", domain: "nowfoods.com" },
      { name: "Nutrex Hawaii", domain: "nutrex-hawaii.com" },
      { name: "Sun Chlorella", domain: "sunchlorella.com" }
    ],
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    lastRunStatus: "success",
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    geo: {
      overallScore: 78,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      categories: [
        { name: "Accessibility", score: 88, issues: 0 },
        { name: "Technical", score: 84, issues: 0 },
        { name: "Content", score: 78, issues: 0 },
        { name: "Authority", score: 65, issues: 1 }
      ],
      firstScore: 64,
      firstScoredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      bestScore: 81,
      worstScore: 64
    }
  };
}

export function createMockRunSummaries(): RunSummary[] {
  const now = Date.now();
  return [
    {
      runId: "run_eb_2026_09",
      startedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      finishedAt: new Date(now - 1000 * 60 * 60 * 11).toISOString(),
      status: "success",
      promptCount: 30,
      resultCount: 120,
      providers: ["ChatGPT (GPT-4o)", "Perplexity", "Gemini 1.5 Pro", "Claude 3.5 Sonnet"]
    },
    {
      runId: "run_eb_2026_08",
      startedAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
      finishedAt: new Date(now - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 45).toISOString(),
      status: "success",
      promptCount: 30,
      resultCount: 116,
      providers: ["ChatGPT (GPT-4o)", "Perplexity", "Gemini 1.5 Pro", "Claude 3.5 Sonnet"]
    },
    {
      runId: "run_eb_2026_07",
      startedAt: new Date(now - 1000 * 60 * 60 * 24 * 14).toISOString(),
      finishedAt: new Date(now - 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 45).toISOString(),
      status: "success",
      promptCount: 30,
      resultCount: 110,
      providers: ["ChatGPT (GPT-4o)", "Perplexity", "Gemini 1.5 Pro", "Claude 3.5 Sonnet"]
    },
    {
      runId: "run_eb_2026_06",
      startedAt: new Date(now - 1000 * 60 * 60 * 24 * 21).toISOString(),
      finishedAt: new Date(now - 1000 * 60 * 60 * 24 * 21 + 1000 * 60 * 45).toISOString(),
      status: "success",
      promptCount: 30,
      resultCount: 104,
      providers: ["ChatGPT (GPT-4o)", "Perplexity", "Gemini 1.5 Pro", "Claude 3.5 Sonnet"]
    }
  ];
}

export function createMockRunOverview(runId?: string): RunOverview {
  const effectiveRunId = runId || "run_eb_2026_09";
  const now = Date.now();

  const prompts: PromptResult[] = [
    {
      promptId: "p_1",
      text: "What are the highest quality spirulina and chlorella tablet brands on the market?",
      citationsCount: 22,
      responsesCount: 4,
      citationShares: { brandPct: 48, competitorPct: 22, neutralPct: 30 },
      responseShares: { brandOnlyPct: 50, competitorOnlyPct: 0, bothPct: 50, neitherPct: 0 }
    },
    {
      promptId: "p_2",
      text: "How does ENERGYbits compare to Athletic Greens AG1 for daily superfood nutrition?",
      citationsCount: 19,
      responsesCount: 4,
      citationShares: { brandPct: 44, competitorPct: 36, neutralPct: 20 },
      responseShares: { brandOnlyPct: 0, competitorOnlyPct: 0, bothPct: 100, neitherPct: 0 }
    },
    {
      promptId: "p_3",
      text: "Best natural algae supplements for cellular energy and mitochondrial health",
      citationsCount: 18,
      responsesCount: 4,
      citationShares: { brandPct: 42, competitorPct: 18, neutralPct: 40 },
      responseShares: { brandOnlyPct: 25, competitorOnlyPct: 0, bothPct: 75, neitherPct: 0 }
    },
    {
      promptId: "p_4",
      text: "Can chlorella tablets help eliminate heavy metals from fasting?",
      citationsCount: 16,
      responsesCount: 4,
      citationShares: { brandPct: 35, competitorPct: 15, neutralPct: 50 },
      responseShares: { brandOnlyPct: 25, competitorOnlyPct: 0, bothPct: 25, neitherPct: 50 }
    },
    {
      promptId: "p_5",
      text: "Which algae tablet is best for muscle recovery and lactic acid after endurance workouts?",
      citationsCount: 15,
      responsesCount: 4,
      citationShares: { brandPct: 45, competitorPct: 25, neutralPct: 30 },
      responseShares: { brandOnlyPct: 25, competitorOnlyPct: 25, bothPct: 50, neitherPct: 0 }
    },
    {
      promptId: "p_6",
      text: "Are raw organically grown algae tablets better than powdered green drinks?",
      citationsCount: 14,
      responsesCount: 4,
      citationShares: { brandPct: 38, competitorPct: 28, neutralPct: 34 },
      responseShares: { brandOnlyPct: 25, competitorOnlyPct: 25, bothPct: 25, neitherPct: 25 }
    },
    {
      promptId: "p_7",
      text: "What makes ENERGYbits spirulina tablets different from grocery store spirulina powders?",
      citationsCount: 14,
      responsesCount: 4,
      citationShares: { brandPct: 55, competitorPct: 15, neutralPct: 30 },
      responseShares: { brandOnlyPct: 50, competitorOnlyPct: 0, bothPct: 50, neitherPct: 0 }
    },
    {
      promptId: "p_8",
      text: "Top vegan protein sources with complete amino acid profile in tablet form",
      citationsCount: 12,
      responsesCount: 4,
      citationShares: { brandPct: 32, competitorPct: 30, neutralPct: 38 },
      responseShares: { brandOnlyPct: 0, competitorOnlyPct: 25, bothPct: 50, neitherPct: 25 }
    }
  ];

  return {
    runId: effectiveRunId,
    createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    projectId: "6a06285ac1f55955b1909d75",
    totals: {
      citations: 164,
      uniqueDomains: 42,
      responses: 120,
      neutralSharePct: 44,
      competitorMentions: 32
    },
    llms: [
      {
        name: "ChatGPT (GPT-4o)",
        citationsCount: 62,
        responsesCount: 35,
        citationShares: { brandPct: 42, competitorPct: 22, neutralPct: 36 },
        responseShares: { brandOnlyPct: 29, competitorOnlyPct: 14, bothPct: 37, neitherPct: 20 }
      },
      {
        name: "Perplexity",
        citationsCount: 52,
        responsesCount: 32,
        citationShares: { brandPct: 46, competitorPct: 18, neutralPct: 36 },
        responseShares: { brandOnlyPct: 34, competitorOnlyPct: 13, bothPct: 38, neitherPct: 15 }
      },
      {
        name: "Gemini 1.5 Pro",
        citationsCount: 34,
        responsesCount: 30,
        citationShares: { brandPct: 32, competitorPct: 28, neutralPct: 40 },
        responseShares: { brandOnlyPct: 20, competitorOnlyPct: 27, bothPct: 30, neitherPct: 23 }
      },
      {
        name: "Claude 3.5 Sonnet",
        citationsCount: 16,
        responsesCount: 23,
        citationShares: { brandPct: 38, competitorPct: 24, neutralPct: 38 },
        responseShares: { brandOnlyPct: 26, competitorOnlyPct: 18, bothPct: 30, neitherPct: 26 }
      }
    ],
    prompts,
    brandVariants: ["ENERGYbits", "energybits", "RECOVERYbits", "VITALITYbits", "SKINNYbits", "Catharine Arnston"]
  };
}

export function createMockProjectPrompts(): ProjectPrompt[] {
  return [
    {
      id: "pr_1",
      text: "What are the highest quality spirulina and chlorella tablet brands on the market?",
      topic: "Superfood Nutrition",
      enabled: true,
      priority: 1,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Health Enthusiast"
    },
    {
      id: "pr_2",
      text: "How does ENERGYbits compare to Athletic Greens AG1 for daily superfood nutrition?",
      topic: "Superfood Nutrition",
      enabled: true,
      priority: 1,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Biohacker"
    },
    {
      id: "pr_3",
      text: "Best natural algae supplements for cellular energy and mitochondrial health",
      topic: "Cellular Energy & Mitochondria",
      enabled: true,
      priority: 2,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Longevity Seeker"
    },
    {
      id: "pr_4",
      text: "Can chlorella tablets help eliminate heavy metals from fasting?",
      topic: "Heavy Metal Detoxification",
      enabled: true,
      priority: 2,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Detox & Fasting"
    },
    {
      id: "pr_5",
      text: "Which algae tablet is best for muscle recovery and lactic acid after endurance workouts?",
      topic: "Athletic Recovery & Endurance",
      enabled: true,
      priority: 3,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Endurance Athlete"
    },
    {
      id: "pr_6",
      text: "Are raw organically grown algae tablets better than powdered green drinks?",
      topic: "Superfood Nutrition",
      enabled: true,
      priority: 3,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Health Enthusiast"
    },
    {
      id: "pr_7",
      text: "What makes ENERGYbits spirulina tablets different from grocery store spirulina powders?",
      topic: "Superfood Nutrition",
      enabled: true,
      priority: 4,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Biohacker"
    },
    {
      id: "pr_8",
      text: "Top vegan protein sources with complete amino acid profile in tablet form",
      topic: "Superfood Nutrition",
      enabled: true,
      priority: 4,
      lastRunId: "run_eb_2026_09",
      buyerPersona: "Plant-Based Athlete"
    }
  ];
}

export function createMockNeutralDomains(limit = 10): NeutralDomain[] {
  const domains: NeutralDomain[] = [
    { domain: "pubmed.ncbi.nlm.nih.gov", docsCount: 32, sharePct: 16.4 },
    { domain: "healthline.com", docsCount: 24, sharePct: 12.3 },
    { domain: "webmd.com", docsCount: 19, sharePct: 9.7 },
    { domain: "examine.com", docsCount: 16, sharePct: 8.2 },
    { domain: "medicalnewstoday.com", docsCount: 14, sharePct: 7.2 },
    { domain: "drweil.com", docsCount: 10, sharePct: 5.1 },
    { domain: "mindbodygreen.com", docsCount: 9, sharePct: 4.6 },
    { domain: "verywellhealth.com", docsCount: 8, sharePct: 4.1 },
    { domain: "clevelandclinic.org", docsCount: 7, sharePct: 3.6 },
    { domain: "nationalgeographic.com", docsCount: 6, sharePct: 3.1 }
  ];
  return domains.slice(0, limit);
}

export function createMockCompetitorVisibility(): CompetitorData[] {
  return [
    {
      name: "Athletic Greens (AG1)",
      citationSharePct: 25,
      responseSharePct: 32,
      promptCoverage: "80%",
      platforms: "ChatGPT, Gemini, Perplexity",
      summary: "Broad podcast sponsorship and creator presence leads in general green superfood queries."
    },
    {
      name: "NOW Foods",
      citationSharePct: 20,
      responseSharePct: 22,
      promptCoverage: "65%",
      platforms: "ChatGPT, Perplexity",
      summary: "Dominates budget-conscious retail spirulina queries across organic grocery search."
    },
    {
      name: "Nutrex Hawaii",
      citationSharePct: 17,
      responseSharePct: 18,
      promptCoverage: "55%",
      platforms: "ChatGPT, Gemini",
      summary: "High association with Hawaiian spirulina and antioxidant carotenoid content."
    },
    {
      name: "Sun Chlorella",
      citationSharePct: 13,
      responseSharePct: 15,
      promptCoverage: "48%",
      platforms: "Perplexity, Claude",
      summary: "Strong presence in pulverized cell wall chlorella and heavy metal detox queries."
    }
  ];
}

export function createMockPerformanceTrend(limit = 8): RunOverview[] {
  const base = createMockRunOverview();
  const now = Date.now();
  const runs: RunOverview[] = [
    {
      ...base,
      runId: "run_eb_2026_06",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 21).toISOString(),
      totals: { citations: 128, uniqueDomains: 34, responses: 98, neutralSharePct: 48, competitorMentions: 36 },
      llms: [
        {
          name: "ChatGPT (GPT-4o)",
          citationsCount: 48,
          responsesCount: 30,
          citationShares: { brandPct: 34, competitorPct: 26, neutralPct: 40 },
          responseShares: { brandOnlyPct: 22, competitorOnlyPct: 20, bothPct: 32, neitherPct: 26 }
        },
        {
          name: "Perplexity",
          citationsCount: 40,
          responsesCount: 26,
          citationShares: { brandPct: 38, competitorPct: 22, neutralPct: 40 },
          responseShares: { brandOnlyPct: 28, competitorOnlyPct: 18, bothPct: 32, neitherPct: 22 }
        },
        {
          name: "Gemini 1.5 Pro",
          citationsCount: 26,
          responsesCount: 24,
          citationShares: { brandPct: 26, competitorPct: 32, neutralPct: 42 },
          responseShares: { brandOnlyPct: 18, competitorOnlyPct: 30, bothPct: 26, neitherPct: 26 }
        },
        {
          name: "Claude 3.5 Sonnet",
          citationsCount: 14,
          responsesCount: 18,
          citationShares: { brandPct: 32, competitorPct: 26, neutralPct: 42 },
          responseShares: { brandOnlyPct: 20, competitorOnlyPct: 22, bothPct: 28, neitherPct: 30 }
        }
      ]
    },
    {
      ...base,
      runId: "run_eb_2026_07",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 14).toISOString(),
      totals: { citations: 140, uniqueDomains: 38, responses: 104, neutralSharePct: 46, competitorMentions: 34 },
      llms: [
        {
          name: "ChatGPT (GPT-4o)",
          citationsCount: 52,
          responsesCount: 32,
          citationShares: { brandPct: 37, competitorPct: 24, neutralPct: 39 },
          responseShares: { brandOnlyPct: 25, competitorOnlyPct: 18, bothPct: 34, neitherPct: 23 }
        },
        {
          name: "Perplexity",
          citationsCount: 44,
          responsesCount: 28,
          citationShares: { brandPct: 41, competitorPct: 20, neutralPct: 39 },
          responseShares: { brandOnlyPct: 30, competitorOnlyPct: 15, bothPct: 35, neitherPct: 20 }
        },
        {
          name: "Gemini 1.5 Pro",
          citationsCount: 29,
          responsesCount: 26,
          citationShares: { brandPct: 28, competitorPct: 30, neutralPct: 42 },
          responseShares: { brandOnlyPct: 19, competitorOnlyPct: 28, bothPct: 28, neitherPct: 25 }
        },
        {
          name: "Claude 3.5 Sonnet",
          citationsCount: 15,
          responsesCount: 18,
          citationShares: { brandPct: 34, competitorPct: 25, neutralPct: 41 },
          responseShares: { brandOnlyPct: 22, competitorOnlyPct: 20, bothPct: 29, neitherPct: 29 }
        }
      ]
    },
    {
      ...base,
      runId: "run_eb_2026_08",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
      totals: { citations: 152, uniqueDomains: 40, responses: 112, neutralSharePct: 45, competitorMentions: 33 },
      llms: [
        {
          name: "ChatGPT (GPT-4o)",
          citationsCount: 58,
          responsesCount: 34,
          citationShares: { brandPct: 39, competitorPct: 23, neutralPct: 38 },
          responseShares: { brandOnlyPct: 27, competitorOnlyPct: 16, bothPct: 35, neitherPct: 22 }
        },
        {
          name: "Perplexity",
          citationsCount: 48,
          responsesCount: 30,
          citationShares: { brandPct: 44, competitorPct: 19, neutralPct: 37 },
          responseShares: { brandOnlyPct: 32, competitorOnlyPct: 14, bothPct: 36, neitherPct: 18 }
        },
        {
          name: "Gemini 1.5 Pro",
          citationsCount: 31,
          responsesCount: 28,
          citationShares: { brandPct: 30, competitorPct: 29, neutralPct: 41 },
          responseShares: { brandOnlyPct: 19, competitorOnlyPct: 28, bothPct: 29, neitherPct: 24 }
        },
        {
          name: "Claude 3.5 Sonnet",
          citationsCount: 15,
          responsesCount: 20,
          citationShares: { brandPct: 36, competitorPct: 24, neutralPct: 40 },
          responseShares: { brandOnlyPct: 24, competitorOnlyPct: 19, bothPct: 29, neitherPct: 28 }
        }
      ]
    },
    base
  ];
  return runs.slice(-limit);
}

export function createMockInsights(runId?: string): Insight[] {
  return [
    {
      type: "strongest",
      text: "ENERGYbits achieves 48% brand citation share in queries specifically naming 'spirulina tablet brands' and 'mitochondrial algae nutrition'.",
      priority: "High"
    },
    {
      type: "top_prompt",
      text: "'What are the highest quality spirulina and chlorella tablet brands?' delivers the highest brand-only answer share (50%) across ChatGPT and Perplexity.",
      priority: "High"
    },
    {
      type: "weakest",
      text: "Neutral clinical platforms (PubMed, Examine.com) represent 44% of citations in heavy metal detox answers, where direct ENERGYbits third-party purity lab results are rarely referenced directly.",
      priority: "Medium"
    },
    {
      type: "recommendation",
      text: "Publish an open-access lab purity index linking Certificate of Analysis (CoA) batches for chlorella to establish direct neutral authority citation links in LLM crawl corpora.",
      priority: "High"
    }
  ];
}

export function createMockDashboard(runId?: string, mockReason?: string): CairrotDashboard {
  const project = createMockProjectDashboard();
  const runs = createMockRunSummaries();
  const allPrompts = createMockProjectPrompts();
  const targetRunId = runId && runs.some((r) => r.runId === runId) ? runId : runs[0].runId;
  const run = createMockRunOverview(targetRunId);

  return {
    project,
    run,
    runs,
    allPrompts,
    fetchedAt: new Date().toISOString(),
    isMock: true,
    mockReason: mockReason || "Local development preview"
  };
}
