/**
 * Cairrot API client (server-only).
 *
 * Caching: all GETs use Next.js fetch cache with revalidate 300s (5 min).
 * Tags: `cairrot` and `run-${runId}` for targeted invalidation via revalidateTag.
 */

import { getCairrotEnv } from "@/lib/env";
import {
  aggregateCompetitors,
  aggregateNeutralDomains,
  buildRunOverview
} from "@/lib/cairrot/aggregate";
import {
  projectCitationsSearch,
  projectPath,
  projectPromptsList,
  projectResponsesSearch,
  projectRunsSearch
} from "@/lib/cairrot/endpoints";
import { CairrotAPIError, CairrotNotFoundError } from "@/lib/cairrot/errors";
import { buildInsights, buildRecommendedActions } from "@/lib/cairrot/insights";
import {
  normalizeProject,
  normalizePrompts,
  type CairrotDashboard,
  type ProjectDashboard,
  type ProjectPrompt
} from "@/lib/cairrot/project-dashboard";
import { unwrapApiData, unwrapDocsBundle } from "@/lib/cairrot/parse";
import type {
  AIReadinessScore,
  CitationHitRaw,
  CitationsResponse,
  CompetitorData,
  DocsBundle,
  Insight,
  MentionRaw,
  NeutralDomain,
  ProjectRaw,
  PromptRaw,
  PromptRunRaw,
  RunOverview,
  RunSummary
} from "@/lib/cairrot/types";

const REQUEST_TIMEOUT_MS = 30_000;
const REVALIDATE_SECONDS = 300;

type SearchParams = Record<string, string | number | undefined>;

function cacheOptions(runId?: string): RequestInit {
  const tags = ["cairrot"];
  if (runId) {
    tags.push(`run-${runId}`);
  }
  return {
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags
    }
  };
}

function toQuery(params: SearchParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function runTimeRange(startedAt: string, finishedAt: string): { startDate: number; endDate: number } {
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime() || Date.now();
  return { startDate: start, endDate: end + 60_000 };
}

export class CairrotClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly projectId: string;

  constructor(config: { apiKey: string; baseUrl: string; projectId: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.projectId = config.projectId;
  }

  private async request<T>(path: string, options: RequestInit = {}, runId?: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const attempt = async (retry: boolean): Promise<T> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            ...(options.headers ?? {})
          },
          ...cacheOptions(runId)
        });

        if (response.status >= 500 && !retry) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return attempt(true);
        }

        const body = (await response.json()) as T | { ok: false; error: { message: string; code: string } };

        if (!response.ok) {
          const message =
            typeof body === "object" && body !== null && "error" in body
              ? (body as { error: { message: string } }).error.message
              : response.statusText;
          throw new CairrotAPIError(message || "Cairrot API error", response.status, path);
        }

        return body as T;
      } catch (error) {
        if (error instanceof CairrotAPIError) {
          throw error;
        }
        if (error instanceof Error && error.name === "AbortError") {
          throw new CairrotAPIError("Cairrot API request timed out", 408, path);
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new CairrotAPIError(message, 500, path);
      } finally {
        clearTimeout(timeout);
      }
    };

    return attempt(false);
  }

  private async fetchAllSearchDocs<T>(
    path: string,
    params: SearchParams,
    runId?: string,
    filterByRunId?: string
  ): Promise<T[]> {
    const docs: T[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext && page <= 20) {
      const raw = await this.request<unknown>(
        `${path}${toQuery({ ...params, page, limit: 100 })}`,
        { method: "GET" },
        runId
      );

      const bundle = unwrapDocsBundle<T>(raw);
      let pageDocs = bundle.docs ?? [];

      if (filterByRunId) {
        pageDocs = pageDocs.filter((doc) => {
          const record = doc as { run_id?: string };
          return record.run_id === filterByRunId;
        });
      }

      docs.push(...pageDocs);
      hasNext = bundle.hasNextPage;
      page += 1;
    }

    return docs;
  }

  async listRuns(limit = 10): Promise<RunSummary[]> {
    const path = projectRunsSearch(this.projectId);
    const raw = await this.request<unknown>(
      `${path}${toQuery({ limit, sortKey: "started_at", sortOrder: "desc" })}`,
      { method: "GET" }
    );

    const bundle = unwrapDocsBundle<PromptRunRaw>(raw);

    return (bundle.docs ?? []).map((run) => ({
      runId: run.run_id,
      startedAt: run.started_at,
      finishedAt: run.finished_at,
      status: run.status,
      promptCount: run.prompt_count,
      resultCount: run.result_count,
      providers: run.providers ?? []
    }));
  }

  private async resolveRun(runId: string): Promise<PromptRunRaw> {
    const path = projectRunsSearch(this.projectId);
    const raw = await this.request<unknown>(
      `${path}${toQuery({ limit: 25, sortKey: "started_at", sortOrder: "desc" })}`,
      { method: "GET" },
      runId
    );
    const match = unwrapDocsBundle<PromptRunRaw>(raw).docs?.find((doc) => doc.run_id === runId);
    if (!match) {
      throw new CairrotNotFoundError(`Run ${runId} not found`, path);
    }
    return match;
  }

  private async fetchRunData(run: PromptRunRaw) {
    const { startDate, endDate } = runTimeRange(run.started_at, run.finished_at);

    const [citations, mentions, prompts, project] = await Promise.all([
      this.fetchAllSearchDocs<CitationHitRaw>(
        projectCitationsSearch(this.projectId),
        { startDate, endDate, sortKey: "captured_at", sortOrder: "desc" },
        run.run_id,
        run.run_id
      ),
      this.fetchAllSearchDocs<MentionRaw>(
        projectResponsesSearch(this.projectId),
        { startDate, endDate, sortKey: "captured_at", sortOrder: "desc" },
        run.run_id,
        run.run_id
      ),
      this.fetchPrompts(),
      this.fetchProject()
    ]);

    return { citations, mentions, prompts, project };
  }

  async getProjectDashboard(): Promise<ProjectDashboard> {
    const raw = await this.fetchProject();
    return normalizeProject(raw);
  }

  async getAllPrompts(): Promise<ProjectPrompt[]> {
    const raw = await this.fetchPrompts();
    return normalizePrompts(raw);
  }

  /** Full Cairrot snapshot: project profile, GEO readiness, all prompts, and latest run AEO visibility. */
  async getFullDashboard(runId?: string): Promise<CairrotDashboard> {
    const [project, runs, allPrompts] = await Promise.all([
      this.getProjectDashboard(),
      this.listRuns(10),
      this.getAllPrompts()
    ]);

    if (runs.length === 0) {
      throw new CairrotNotFoundError("No prompt runs found for this project", projectRunsSearch(this.projectId));
    }

    const targetRunId = runId && runs.some((r) => r.runId === runId) ? runId : runs[0].runId;
    const run = await this.getRun(targetRunId);

    return {
      project,
      run,
      runs,
      allPrompts,
      fetchedAt: new Date().toISOString()
    };
  }

  /** Full totals + LLM breakdown for the last N runs, oldest first — used for trend charts. */
  async getPerformanceTrend(limit = 8): Promise<RunOverview[]> {
    const runs = await this.listRuns(limit);
    const overviews = await Promise.all(runs.map((r) => this.getRun(r.runId)));
    return overviews.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getLatestRun(): Promise<RunOverview> {
    const runs = await this.listRuns(1);
    if (runs.length === 0) {
      throw new CairrotNotFoundError("No prompt runs found for this project", projectRunsSearch(this.projectId));
    }
    return this.getRun(runs[0].runId);
  }

  async getRun(runId: string): Promise<RunOverview> {
    const run = await this.resolveRun(runId);
    const { citations, mentions, prompts, project } = await this.fetchRunData(run);

    return buildRunOverview({
      runId: run.run_id,
      projectId: this.projectId,
      startedAt: run.started_at,
      citations,
      mentions,
      prompts,
      brandVariants: project.keywords ?? []
    });
  }

  async getCitations(runId: string): Promise<CitationsResponse> {
    const run = await this.resolveRun(runId);
    const { startDate, endDate } = runTimeRange(run.started_at, run.finished_at);
    const items = await this.fetchAllSearchDocs<CitationHitRaw>(
      projectCitationsSearch(this.projectId),
      { startDate, endDate, sortKey: "captured_at", sortOrder: "desc" },
      runId,
      runId
    );
    return { items, totalDocs: items.length };
  }

  async getPrompts(runId: string) {
    const run = await this.resolveRun(runId);
    const { citations, mentions, prompts, project } = await this.fetchRunData(run);
    const overview = buildRunOverview({
      runId,
      projectId: this.projectId,
      startedAt: run.started_at,
      citations,
      mentions,
      prompts,
      brandVariants: project.keywords ?? []
    });
    return overview.prompts;
  }

  async getNeutralDomains(runId: string, limit = 10): Promise<NeutralDomain[]> {
    const { items } = await this.getCitations(runId);
    return aggregateNeutralDomains(items, limit);
  }

  async getCompetitorVisibility(runId: string): Promise<CompetitorData[]> {
    const run = await this.resolveRun(runId);
    const { citations, mentions } = await this.fetchRunData(run);
    return aggregateCompetitors(citations, mentions);
  }

  async getAIReadiness(): Promise<AIReadinessScore> {
    const project = await this.getProjectDashboard();
    return project.geo;
  }

  async getInsights(runId: string): Promise<Insight[]> {
    const run = await this.getRun(runId);
    return buildInsights(run);
  }

  getRecommendedActions(run: RunOverview): string[] {
    return buildRecommendedActions(run);
  }

  private async fetchProject(): Promise<ProjectRaw> {
    const raw = await this.request<unknown>(projectPath(this.projectId), { method: "GET" });
    return unwrapApiData<ProjectRaw>(raw);
  }

  private async fetchPrompts(): Promise<PromptRaw[]> {
    const path = projectPromptsList(this.projectId);
    const raw = await this.request<unknown>(`${path}${toQuery({ limit: 100, page: 1 })}`, { method: "GET" });
    const data = unwrapApiData<PromptRaw[] | { items?: PromptRaw[] }>(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return data.items ?? [];
  }
}

function createClient(): CairrotClient {
  const env = getCairrotEnv();
  return new CairrotClient({
    apiKey: env.CAIRROT_API_KEY,
    baseUrl: env.CAIRROT_API_BASE_URL,
    projectId: env.CAIRROT_PROJECT_ID
  });
}

/** Lazy singleton — env validated on first use. */
let singleton: CairrotClient | null = null;

export function getCairrotClient(): CairrotClient {
  if (!singleton) {
    singleton = createClient();
  }
  return singleton;
}

