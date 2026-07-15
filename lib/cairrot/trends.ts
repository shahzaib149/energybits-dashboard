import type { RunOverview } from "@/lib/cairrot/types";

export interface RunTrendPoint {
  period: string;
  citations: number;
  responses: number;
  [provider: string]: string | number | undefined;
}

const PROVIDER_COLORS: Record<string, string> = {
  gpt: "#10B981",
  gemini: "#3B82F6",
  perplexity: "#A855F7",
  claude: "#F59E0B",
  grok: "#EF4444",
  deepseek: "#06B6D4"
};

export function providerColor(name: string): string {
  return PROVIDER_COLORS[name.toLowerCase()] ?? "#71717A";
}

/** One point per run — LLM providers absent from a run's breakdown are left
 * unset so the chart shows a gap instead of a misleading flat zero. */
export function buildRunTrendPoints(runs: RunOverview[]): RunTrendPoint[] {
  return runs.map((run) => {
    const point: RunTrendPoint = {
      period: run.createdAt,
      citations: run.totals.citations,
      responses: run.totals.responses
    };
    for (const llm of run.llms) {
      point[llm.name] = llm.citationsCount;
    }
    return point;
  });
}

export function getUniqueProviders(runs: RunOverview[]): string[] {
  const providers = new Set<string>();
  for (const run of runs) {
    for (const llm of run.llms) providers.add(llm.name);
  }
  return Array.from(providers).sort();
}
