import type { LLMBreakdown, PromptResult, RunOverview } from "@/lib/cairrot/types";
import { formatPercent } from "@/lib/utils/format";

export function formatAnalysisLabel(runId: string): string {
  const suffix = runId.replace(/-/g, "").slice(-4).toUpperCase();
  return `Analysis #${suffix}`;
}

export function formatRunStatusLabel(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "success") return "completed";
  if (normalized === "failed") return "failed";
  if (normalized === "running" || normalized === "in_progress") return "in progress";
  return status;
}

export function formatWorkspaceId(id: string): string {
  return id.slice(-6).toUpperCase();
}

export function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export interface AtAGlanceStats {
  brandMentionPct: number;
  promptsWithBrand: number;
  totalPrompts: number;
  strongestPlatform: LLMBreakdown | null;
  opportunities: number;
}

export function computeAtAGlance(run: RunOverview): AtAGlanceStats {
  const totalPrompts = run.prompts.length;
  const promptsWithBrand = run.prompts.filter(hasBrandPresence).length;
  const opportunities = run.prompts.filter((p) => !hasBrandPresence(p)).length;

  let strongestPlatform: LLMBreakdown | null = null;
  for (const llm of run.llms) {
    if (!strongestPlatform || llm.citationShares.brandPct > strongestPlatform.citationShares.brandPct) {
      strongestPlatform = llm;
    }
  }

  let brandAnswerCount = 0;
  let totalResponses = 0;
  for (const llm of run.llms) {
    totalResponses += llm.responsesCount;
    brandAnswerCount += Math.round(
      ((llm.responseShares.brandOnlyPct + llm.responseShares.bothPct) / 100) * llm.responsesCount
    );
  }
  const brandMentionPct = totalResponses > 0 ? (brandAnswerCount / totalResponses) * 100 : 0;

  return {
    brandMentionPct,
    promptsWithBrand,
    totalPrompts,
    strongestPlatform,
    opportunities
  };
}

function hasBrandPresence(prompt: PromptResult): boolean {
  return (
    prompt.citationShares.brandPct > 0 ||
    prompt.responseShares.brandOnlyPct > 0 ||
    prompt.responseShares.bothPct > 0
  );
}

export function formatBrandMentionPct(pct: number): string {
  return formatPercent(pct);
}
