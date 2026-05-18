import type { Insight, PromptResult, RunOverview } from "@/lib/cairrot/types";

export function buildInsights(run: RunOverview): Insight[] {
  const insights: Insight[] = [];

  const sortedLlms = [...run.llms].sort((a, b) => b.citationsCount - a.citationsCount);
  const strongest = sortedLlms[0];
  const weakest = sortedLlms[sortedLlms.length - 1];

  if (strongest) {
    insights.push({
      type: "strongest",
      text: `${strongest.name} drives the most citations (${strongest.citationsCount}) and ${strongest.responsesCount} responses in this run.`,
      priority: "Medium"
    });
  }

  if (weakest && weakest.name !== strongest?.name) {
    insights.push({
      type: "weakest",
      text: `${weakest.name} has the lowest citation volume (${weakest.citationsCount}). Consider prompt coverage and source clarity for this provider.`,
      priority: "Medium"
    });
  }

  const topPrompt = [...run.prompts].sort((a, b) => b.citationsCount - a.citationsCount)[0];
  if (topPrompt) {
    insights.push({
      type: "top_prompt",
      text: `Top prompt by citations: "${topPrompt.text.slice(0, 120)}${topPrompt.text.length > 120 ? "…" : ""}"`,
      priority: "High"
    });
  }

  if (run.totals.neutralSharePct >= 90) {
    insights.push({
      type: "recommendation",
      text: "Neutral citation share is very high. Publish comparison and evidence-led pages that convert informational demand into brand-specific citations.",
      priority: "High"
    });
  }

  if (run.totals.competitorMentions > 0) {
    insights.push({
      type: "recommendation",
      text: `Competitors appear in ${run.totals.competitorMentions} response(s). Strengthen differentiated claims on priority product pages.`,
      priority: "Medium"
    });
  }

  if (run.brandVariants.length > 0) {
    insights.push({
      type: "brand_variants",
      text: `Brand variants tracked: ${run.brandVariants.join(", ")}`,
      priority: "Low"
    });
  }

  return insights;
}

export function buildRecommendedActions(run: RunOverview): string[] {
  const actions: string[] = [];

  if (run.totals.neutralSharePct >= 85) {
    actions.push("Add FAQ blocks and schema on pages tied to high-neutral prompts.");
  }

  if (run.prompts.length > 0) {
    actions.push("Refresh content for the top 2 prompts by citation volume with updated product claims.");
  }

  actions.push("Re-run Cairrot after publishing updates to measure citation mix movement.");

  return actions;
}
