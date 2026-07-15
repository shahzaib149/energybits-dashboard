import type { AIReadinessScore, ProjectRaw, PromptRaw, RunOverview, RunSummary } from "@/lib/cairrot/types";

export interface CairrotDashboard {
  project: ProjectDashboard;
  run: RunOverview;
  runs: RunSummary[];
  allPrompts: ProjectPrompt[];
  fetchedAt: string;
}

export interface ProjectDashboard {
  id: string;
  url: string;
  host: string;
  description: string;
  planCode: string;
  keywords: string[];
  topics: string[];
  competitors: Array<{ name: string; domain: string }>;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  nextRunAt: string | null;
  geo: AIReadinessScore;
}

export interface ProjectPrompt {
  id: string;
  text: string;
  topic: string;
  enabled: boolean;
  priority: number;
  lastRunId: string | null;
  buyerPersona: string | null;
}

function capitalizeBucket(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function normalizeProject(raw: ProjectRaw): ProjectDashboard {
  const buckets = raw.lastReadinessBuckets ?? {};
  const topics =
    raw.topics?.map((t) => (typeof t === "string" ? t : (t as { name?: string }).name ?? "")).filter(Boolean) ??
    [];

  return {
    id: raw.id,
    url: raw.url ?? raw.host ?? "",
    host: raw.host ?? raw.url ?? "",
    description: raw.description ?? "",
    planCode: raw.planCode ?? "—",
    keywords: raw.keywords ?? [],
    topics,
    competitors: (raw.competitors ?? []).map((c) => ({
      name: c.name,
      domain: c.domain ?? ""
    })),
    lastRunAt: raw.lastRunAt ?? null,
    lastRunStatus: raw.lastRunStatus ?? null,
    nextRunAt: raw.nextRunAt ?? null,
    geo: {
      overallScore: raw.lastReadinessScore ?? 0,
      lastUpdated: raw.lastReadinessAt ?? new Date().toISOString(),
      categories: Object.entries(buckets).map(([name, score]) => ({
        name: capitalizeBucket(name),
        score,
        issues: score < 70 ? 1 : 0
      })),
      firstScore: raw.firstReadinessScore ?? null,
      firstScoredAt: raw.firstReadinessAt ?? null,
      bestScore: raw.bestReadinessScore ?? null,
      worstScore: raw.worstReadinessScore ?? null
    }
  };
}

export function normalizePrompts(raw: PromptRaw[]): ProjectPrompt[] {
  return raw.map((prompt) => ({
    id: prompt.id,
    text: prompt.text,
    topic: prompt.topic ?? "General",
    enabled: prompt.enabled ?? true,
    priority: prompt.priority ?? 0,
    lastRunId: prompt.lastRun?.runId ?? prompt.lastRun?.run_id ?? null,
    buyerPersona:
      (prompt as { buyerProfileId?: { name?: string } }).buyerProfileId?.name ??
      (prompt as { buyer_profile_name?: string }).buyer_profile_name ??
      null
  }));
}
