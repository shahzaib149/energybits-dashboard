/** Normalized shapes consumed by Overview UI (camelCase). */

export interface RunOverview {
  runId: string;
  createdAt: string;
  projectId: string;
  totals: {
    citations: number;
    uniqueDomains: number;
    responses: number;
    neutralSharePct: number;
    competitorMentions: number;
  };
  llms: LLMBreakdown[];
  prompts: PromptResult[];
  brandVariants: string[];
}

export interface RunSummary {
  runId: string;
  startedAt: string;
  finishedAt: string;
  status: string;
  promptCount: number;
  resultCount: number;
  providers: string[];
}

export interface LLMBreakdown {
  name: string;
  citationsCount: number;
  responsesCount: number;
  citationShares: ShareTriple;
  responseShares: ResponseShareQuad;
}

export interface ShareTriple {
  brandPct: number;
  competitorPct: number;
  neutralPct: number;
}

export interface ResponseShareQuad {
  brandOnlyPct: number;
  competitorOnlyPct: number;
  bothPct: number;
  neitherPct: number;
}

export interface PromptResult {
  promptId: string;
  text: string;
  citationsCount: number;
  responsesCount: number;
  citationShares: ShareTriple;
  responseShares: ResponseShareQuad;
}

export interface NeutralDomain {
  domain: string;
  docsCount: number;
  sharePct: number;
}

export interface CompetitorData {
  name: string;
  citationSharePct: number;
  responseSharePct: number;
  promptCoverage?: string;
  platforms?: string;
  summary?: string;
}

export interface Insight {
  type: "strongest" | "weakest" | "top_prompt" | "recommendation" | "brand_variants";
  text: string;
  priority?: "High" | "Medium" | "Low";
  metadata?: Record<string, unknown>;
}

export interface AIReadinessScore {
  overallScore: number;
  categories: { name: string; score: number; issues: number }[];
  lastUpdated: string;
}

export interface CitationsResponse {
  items: CitationRecord[];
  totalDocs: number;
}

// --- Raw API types (snake_case from Cairrot OpenAPI) ---

export interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
}

export interface ApiErrorBody {
  ok: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
}

export interface DocsBundle<T> {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  totalDocs: number;
  docs: T[];
}

export interface PromptRunRaw {
  id: string;
  project_id: string;
  run_id: string;
  started_at: string;
  finished_at: string;
  prompt_count: number;
  result_count: number;
  providers: string[];
  status: string;
}

export interface CitationHitRaw {
  id: string;
  subject?: string;
  topic?: string;
  provider: string;
  captured_at: string;
  rank?: number;
  page: {
    registrable_domain: string;
    url_host?: string;
    title?: string;
  };
  flags?: {
    is_competitor?: boolean;
    mentions_subject?: boolean;
    mentions_project?: boolean;
  };
  comp_hits?: { by_name?: string[] };
  competitor_hits?: { by_name?: string[] };
  prompt_id?: string;
  prompt_text?: string;
  run_id?: string;
}

export interface MentionRaw {
  id: string;
  subject?: string;
  prompt_text?: string;
  prompt_id?: string;
  provider: string;
  captured_at: string;
  run_id?: string;
  llm?: {
    brand_hits?: { by_name?: string[] };
    comp_hits?: { by_name?: string[] };
  };
  analysis?: {
    brand_hits?: { by_name?: string[] };
    competitor_hits?: { by_name?: string[] };
  };
}

export interface PromptRaw {
  id: string;
  projectId?: string;
  project_id?: string;
  topic?: string;
  text: string;
  enabled?: boolean;
  priority?: number;
  lastRun?: {
    runId?: string;
    run_id?: string;
    byProvider?: Record<
      string,
      {
        provider: string;
        counts?: {
          llm_citations_total?: number;
          llm_outputs?: number;
        };
        pct?: Record<string, number>;
      }
    >;
  };
}

export interface ProjectRaw {
  id: string;
  url?: string;
  host?: string;
  description?: string;
  planCode?: string;
  keywords?: string[];
  topics?: Array<string | { name: string }>;
  lastReadinessScore?: number;
  lastReadinessAt?: string;
  lastReadinessBuckets?: Record<string, number>;
  lastRunAt?: string;
  lastRunStatus?: string;
  nextRunAt?: string;
  competitors?: Array<{ name: string; domain?: string }>;
}

export type CitationRecord = CitationHitRaw;
