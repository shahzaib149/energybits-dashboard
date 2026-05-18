export type OverviewTone = "brand" | "competitor" | "neutral" | "both" | "neither";

export interface OverviewBreakdownRow {
  label: string;
  percent: number;
  tone: OverviewTone;
}

export interface OverviewMetric {
  label: string;
  value: string;
  icon: "citations" | "domains" | "responses" | "neutral" | "competitor";
}

export interface LLMAnalysisCard {
  name: string;
  badge: string;
  citations: number;
  responses: number;
  citationBreakdown: OverviewBreakdownRow[];
  responseBreakdown: OverviewBreakdownRow[];
}

export interface PromptAnalysisCard {
  title: string;
  citations: number;
  responses: number;
  citationBreakdown: OverviewBreakdownRow[];
  responseBreakdown: OverviewBreakdownRow[];
}

export interface CompetitorVisibilityCard {
  name: string;
  citationShare: string;
  promptCoverage: string;
  platforms: string;
  summary: string;
}

export interface InsightActionCard {
  title: string;
  body: string;
  priority: "High" | "Medium" | "Low";
}

export const overviewSummaryMetrics: OverviewMetric[] = [
  { label: "Total Citations", value: "229", icon: "citations" },
  { label: "Unique Citation Domains", value: "148", icon: "domains" },
  { label: "Responses", value: "24", icon: "responses" },
  { label: "Neutral Share (Citations)", value: "98.7%", icon: "neutral" },
  { label: "Competitor Mentions (Responses)", value: "1", icon: "competitor" }
];

export const llmAnalysisCards: LLMAnalysisCard[] = [
  {
    name: "GPT",
    badge: "OpenAI",
    citations: 61,
    responses: 8,
    citationBreakdown: [
      { label: "Brand", percent: 1.6, tone: "brand" },
      { label: "Competitor", percent: 1.6, tone: "competitor" },
      { label: "Neutral", percent: 96.7, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 12.5, tone: "brand" },
      { label: "Comp only", percent: 12.5, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 75, tone: "neither" }
    ]
  },
  {
    name: "Gemini",
    badge: "Google",
    citations: 102,
    responses: 8,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 1, tone: "competitor" },
      { label: "Neutral", percent: 99, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 12.5, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 87.5, tone: "neither" }
    ]
  },
  {
    name: "Perplexity",
    badge: "Search",
    citations: 66,
    responses: 8,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 0, tone: "competitor" },
      { label: "Neutral", percent: 100, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 0, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 100, tone: "neither" }
    ]
  }
];

export const promptAnalysisCards: PromptAnalysisCard[] = [
  {
    title: "What are the top chlorella and spirulina detox supplements for athletic performance?",
    citations: 29,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 6.9, tone: "competitor" },
      { label: "Neutral", percent: 93.1, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 0, tone: "brand" },
      { label: "Comp only", percent: 33.3, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 66.7, tone: "neither" }
    ]
  },
  {
    title: "Which brands make the best algae-based sports nutrition supplements for endurance athletes?",
    citations: 27,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 3.7, tone: "brand" },
      { label: "Competitor", percent: 0, tone: "competitor" },
      { label: "Neutral", percent: 96.3, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 66.7, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 33.3, tone: "neither" }
    ]
  },
  {
    title: "Can you recommend natural wellness products that support recovery and reduce fatigue?",
    citations: 38,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 0, tone: "competitor" },
      { label: "Neutral", percent: 100, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 0, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 100, tone: "neither" }
    ]
  },
  {
    title: "Can you recommend clean, plant-based wellness products for energy and mental clarity?",
    citations: 35,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 0, tone: "competitor" },
      { label: "Neutral", percent: 100, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 0, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 100, tone: "neither" }
    ]
  },
  {
    title: "Which brands offer natural supplements for athletic recovery and endurance performance?",
    citations: 28,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 0, tone: "competitor" },
      { label: "Neutral", percent: 100, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 0, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 100, tone: "neither" }
    ]
  },
  {
    title: "What are the best pure algae-based supplements with no additives for daily nutrition?",
    citations: 27,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 0, tone: "competitor" },
      { label: "Neutral", percent: 100, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 0, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 100, tone: "neither" }
    ]
  },
  {
    title: "What are the best clean, additive-free supplement brands for athletes?",
    citations: 23,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 4.3, tone: "brand" },
      { label: "Competitor", percent: 0, tone: "competitor" },
      { label: "Neutral", percent: 95.7, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 33.3, tone: "brand" },
      { label: "Comp only", percent: 0, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 66.7, tone: "neither" }
    ]
  },
  {
    title: "What are the top chlorella-based detox supplements backed by scientific evidence?",
    citations: 22,
    responses: 3,
    citationBreakdown: [
      { label: "Brand", percent: 0, tone: "brand" },
      { label: "Competitor", percent: 4.5, tone: "competitor" },
      { label: "Neutral", percent: 95.5, tone: "neutral" }
    ],
    responseBreakdown: [
      { label: "Brand only", percent: 0, tone: "brand" },
      { label: "Comp only", percent: 33.3, tone: "competitor" },
      { label: "Both", percent: 0, tone: "both" },
      { label: "Neither", percent: 66.7, tone: "neither" }
    ]
  }
];

export const competitorVisibilityCards: CompetitorVisibilityCard[] = [
  {
    name: "NOW Foods",
    citationShare: "2.6%",
    promptCoverage: "3 of 8 prompts",
    platforms: "GPT, Gemini",
    summary: "Shows up in athlete-focused detox and clean-supplement comparisons, but rarely in direct recommendation answers."
  },
  {
    name: "Nested Naturals",
    citationShare: "1.7%",
    promptCoverage: "2 of 8 prompts",
    platforms: "GPT",
    summary: "Appears in wellness recovery prompts; visibility is concentrated in citations rather than answer-level mentions."
  },
  {
    name: "Vimergy",
    citationShare: "1.3%",
    promptCoverage: "1 of 8 prompts",
    platforms: "Gemini",
    summary: "Low but notable presence in ingredient-purity prompts, indicating a narrow authority footprint."
  }
];

export const insightActionCards: InsightActionCard[] = [
  {
    title: "Neutral coverage is high, but branded recall is thin",
    body: "Most model outputs cite category-level or informational sources without naming the brand. The short-term opportunity is to create pages that convert neutral informational demand into brand-specific retrieval.",
    priority: "High"
  },
  {
    title: "Endurance and detox prompts drive the strongest openings",
    body: "The only meaningful branded or competitor activity clusters around athletic detox and endurance-supplement queries. These topics should anchor the next batch of comparison and evidence-led content.",
    priority: "High"
  },
  {
    title: "Perplexity is informationally strong but commercially quiet",
    body: "Perplexity produces the cleanest neutral profile with no direct brand or competitor lift. Structured citations, FAQs, and comparison snippets should be tested here first.",
    priority: "Medium"
  }
];

export const nextActionItems: string[] = [
  "Publish two evidence-backed comparison pages targeting algae-based endurance and detox supplement prompts.",
  "Add clearer brand entities, product claims, and citation-ready supporting references to priority pages.",
  "Build prompt-specific FAQ blocks aimed at converting neutral informational answers into brand-only responses.",
  "Track whether competitor mentions stay isolated to GPT/Gemini after the next content refresh."
];
