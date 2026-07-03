import type { CairrotDashboard, ProjectPrompt } from "@/lib/cairrot/project-dashboard";
import type { PromptResult } from "@/lib/cairrot/types";
import { computeAtAGlance } from "@/lib/utils/overview-display";
import { formatDate, formatDateTime, formatNumber, formatPercent } from "@/lib/utils/format";
import { PdfReport, MUTED } from "@/lib/reports/pdf-builder";

export function buildAEOAnalyticsPdf(dashboard: CairrotDashboard): Buffer {
  const { project, run, runs, allPrompts, fetchedAt } = dashboard;
  const report = new PdfReport("ENERGYbits - AEO Analytics Report");
  const latestRun = runs.find((item) => item.runId === run.runId);
  const atAGlance = computeAtAGlance(run);
  const zeroPresencePrompts = run.prompts.filter((prompt) => brandMentionPct(prompt) === 0);
  const competitorDominatedPrompts = run.prompts.filter(
    (prompt) => competitorMentionPct(prompt) > brandMentionPct(prompt)
  );
  const brandStrongPrompts = run.prompts.filter((prompt) => brandMentionPct(prompt) >= 30);

  report.coverHeader(
    "AI Search Visibility",
    "AEO Analytics Report",
    project.url || project.host || "ENERGYbits"
  );
  report.metaGrid([
    { label: "Project", value: project.url || project.host || "ENERGYbits" },
    { label: "Analysis date", value: formatDate(run.createdAt) },
    { label: "Run ID", value: run.runId },
    { label: "Providers", value: latestRun?.providers.join(", ") || run.llms.map((llm) => llm.name).join(", ") },
    { label: "Generated", value: formatDateTime(new Date().toISOString()) },
    { label: "Data updated", value: formatDateTime(fetchedAt) }
  ]);

  report.sectionHeading("Executive Summary");
  report.metricGrid([
    { label: "Brand mention rate", value: formatPercent(atAGlance.brandMentionPct) },
    { label: "Tracked questions", value: formatNumber(atAGlance.totalPrompts) },
    { label: "Questions with brand", value: formatNumber(atAGlance.promptsWithBrand) },
    { label: "Zero presence", value: formatNumber(atAGlance.opportunities) },
    { label: "Total citations", value: formatNumber(run.totals.citations) },
    { label: "Unique domains", value: formatNumber(run.totals.uniqueDomains) },
    { label: "Responses", value: formatNumber(run.totals.responses) },
    { label: "Competitor mentions", value: formatNumber(run.totals.competitorMentions) }
  ]);

  report.sectionHeading("Performance by AI Engine");
  report.table(
    ["Engine", "Citations", "Responses", "Brand cite", "Comp cite", "Brand mention", "Comp mention"],
    run.llms.map((llm) => [
      llm.name,
      formatNumber(llm.citationsCount),
      formatNumber(llm.responsesCount),
      formatPercent(llm.citationShares.brandPct),
      formatPercent(llm.citationShares.competitorPct),
      formatPercent(llm.responseShares.brandOnlyPct + llm.responseShares.bothPct),
      formatPercent(llm.responseShares.competitorOnlyPct + llm.responseShares.bothPct)
    ]),
    [100, 70, 70, 70, 70, 85, 85]
  );

  addPromptSection(report, "Zero-Presence Questions", zeroPresencePrompts, allPrompts);
  addPromptSection(report, "Competitor-Dominated Questions", competitorDominatedPrompts, allPrompts);
  addPromptSection(report, "Brand-Strong Questions", brandStrongPrompts, allPrompts);

  report.sectionHeading("Tracked Competitors");
  report.list(
    project.competitors.length > 0
      ? project.competitors.map((competitor) => `${competitor.name}${competitor.domain ? ` - ${competitor.domain}` : ""}`)
      : ["No competitors configured."]
  );

  report.sectionHeading("Tracked Topics");
  if (project.topics.length > 0) {
    report.chips(project.topics);
  } else {
    report.paragraph("No topics configured.", { color: MUTED });
  }

  return report.toBuffer();
}

function addPromptSection(
  report: PdfReport,
  title: string,
  prompts: PromptResult[],
  allPrompts: ProjectPrompt[]
) {
  report.sectionHeading(title);

  if (prompts.length === 0) {
    report.paragraph(`No ${title.toLowerCase()} in this scan.`, { color: MUTED });
    return;
  }

  report.table(
    ["Question", "Topic", "Audience", "Brand", "Comp", "Neither"],
    prompts.map((prompt) => {
      const meta = promptMeta(prompt.promptId, allPrompts);
      return [
        prompt.text,
        meta.topic,
        meta.buyerPersona,
        formatPercent(brandMentionPct(prompt)),
        formatPercent(competitorMentionPct(prompt)),
        formatPercent(prompt.responseShares.neitherPct)
      ];
    }),
    [216, 88, 82, 44, 44, 44]
  );
}

function brandMentionPct(prompt: PromptResult): number {
  return prompt.responseShares.brandOnlyPct + prompt.responseShares.bothPct;
}

function competitorMentionPct(prompt: PromptResult): number {
  return prompt.responseShares.competitorOnlyPct + prompt.responseShares.bothPct;
}

function promptMeta(promptId: string, allPrompts: ProjectPrompt[]) {
  const match = allPrompts.find((prompt) => prompt.id === promptId);
  return {
    topic: match?.topic || "General",
    buyerPersona: match?.buyerPersona || "Unknown"
  };
}
