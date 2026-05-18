import type {
  CitationHitRaw,
  CompetitorData,
  LLMBreakdown,
  MentionRaw,
  NeutralDomain,
  PromptRaw,
  PromptResult,
  ResponseShareQuad,
  RunOverview,
  ShareTriple
} from "@/lib/cairrot/types";

const PROVIDER_LABELS: Record<string, string> = {
  gpt: "GPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  claude: "Claude",
  grok: "Grok",
  deepseek: "DeepSeek"
};

function providerLabel(provider: string): string {
  const key = provider.toLowerCase();
  return PROVIDER_LABELS[key] ?? provider.toUpperCase();
}

function classifyCitation(hit: CitationHitRaw): "brand" | "competitor" | "neutral" {
  if (hit.flags?.is_competitor) {
    return "competitor";
  }
  if (hit.flags?.mentions_project ?? hit.flags?.mentions_subject) {
    return "brand";
  }
  return "neutral";
}

function classifyMention(mention: MentionRaw): "brand_only" | "competitor_only" | "both" | "neither" {
  const brandCount =
    mention.llm?.brand_hits?.by_name?.length ?? mention.analysis?.brand_hits?.by_name?.length ?? 0;
  const compCount =
    mention.llm?.comp_hits?.by_name?.length ?? mention.analysis?.competitor_hits?.by_name?.length ?? 0;
  if (brandCount > 0 && compCount > 0) {
    return "both";
  }
  if (brandCount > 0) {
    return "brand_only";
  }
  if (compCount > 0) {
    return "competitor_only";
  }
  return "neither";
}

function sharesFromCounts(counts: { brand: number; competitor: number; neutral: number }): ShareTriple {
  const total = counts.brand + counts.competitor + counts.neutral || 1;
  return {
    brandPct: (counts.brand / total) * 100,
    competitorPct: (counts.competitor / total) * 100,
    neutralPct: (counts.neutral / total) * 100
  };
}

function responseSharesFromCounts(counts: {
  brandOnly: number;
  competitorOnly: number;
  both: number;
  neither: number;
}): ResponseShareQuad {
  const total = counts.brandOnly + counts.competitorOnly + counts.both + counts.neither || 1;
  return {
    brandOnlyPct: (counts.brandOnly / total) * 100,
    competitorOnlyPct: (counts.competitorOnly / total) * 100,
    bothPct: (counts.both / total) * 100,
    neitherPct: (counts.neither / total) * 100
  };
}

function buildLlmBreakdowns(citations: CitationHitRaw[], mentions: MentionRaw[]): LLMBreakdown[] {
  const providers = new Set<string>();
  citations.forEach((c) => providers.add(c.provider));
  mentions.forEach((m) => providers.add(m.provider));

  return Array.from(providers).map((provider) => {
    const providerCitations = citations.filter((c) => c.provider === provider);
    const providerMentions = mentions.filter((m) => m.provider === provider);

    const citationCounts = { brand: 0, competitor: 0, neutral: 0 };
    for (const hit of providerCitations) {
      citationCounts[classifyCitation(hit)] += 1;
    }

    const responseCounts = { brandOnly: 0, competitorOnly: 0, both: 0, neither: 0 };
    for (const mention of providerMentions) {
      const bucket = classifyMention(mention);
      if (bucket === "brand_only") {
        responseCounts.brandOnly += 1;
      } else if (bucket === "competitor_only") {
        responseCounts.competitorOnly += 1;
      } else if (bucket === "both") {
        responseCounts.both += 1;
      } else {
        responseCounts.neither += 1;
      }
    }

    return {
      name: providerLabel(provider),
      citationsCount: providerCitations.length,
      responsesCount: providerMentions.length,
      citationShares: sharesFromCounts(citationCounts),
      responseShares: responseSharesFromCounts(responseCounts)
    };
  });
}

function buildPromptResults(prompts: PromptRaw[], runId: string, citations: CitationHitRaw[], mentions: MentionRaw[]): PromptResult[] {
  const runPrompts = prompts.filter((p) => {
    const lastRunId = p.lastRun?.runId ?? p.lastRun?.run_id;
    return !lastRunId || lastRunId === runId;
  });

  return runPrompts.map((prompt) => {
    const promptCitations = citations.filter((c) => {
      const citationPromptId = (c as { prompt_id?: string }).prompt_id;
      if (citationPromptId && prompt.id) {
        return citationPromptId === prompt.id;
      }
      const subject = (c.subject ?? (c as { prompt_text?: string }).prompt_text ?? "").toLowerCase();
      const subjectKey = prompt.text.slice(0, 80).toLowerCase();
      return subject.includes(subjectKey.slice(0, 40)) || subjectKey.includes(subject.slice(0, 40));
    });
    const promptMentions = mentions.filter((m) => {
      if (m.prompt_id && prompt.id) {
        return m.prompt_id === prompt.id;
      }
      const subject = (m.subject ?? m.prompt_text ?? "").toLowerCase();
      const subjectKey = prompt.text.slice(0, 80).toLowerCase();
      return subject.includes(subjectKey.slice(0, 40)) || subjectKey.includes(subject.slice(0, 40));
    });

    const citationCounts = { brand: 0, competitor: 0, neutral: 0 };
    for (const hit of promptCitations) {
      citationCounts[classifyCitation(hit)] += 1;
    }

    const responseCounts = { brandOnly: 0, competitorOnly: 0, both: 0, neither: 0 };
    for (const mention of promptMentions) {
      const bucket = classifyMention(mention);
      if (bucket === "brand_only") {
        responseCounts.brandOnly += 1;
      } else if (bucket === "competitor_only") {
        responseCounts.competitorOnly += 1;
      } else if (bucket === "both") {
        responseCounts.both += 1;
      } else {
        responseCounts.neither += 1;
      }
    }

    let citationsCount = promptCitations.length;
    let responsesCount = promptMentions.length;

    if (prompt.lastRun?.byProvider) {
      for (const stats of Object.values(prompt.lastRun.byProvider)) {
        citationsCount = Math.max(citationsCount, stats.counts?.llm_citations_total ?? 0);
        responsesCount = Math.max(responsesCount, stats.counts?.llm_outputs ?? 0);
      }
    }

    return {
      promptId: prompt.id,
      text: prompt.text,
      citationsCount,
      responsesCount,
      citationShares: sharesFromCounts(citationCounts),
      responseShares: responseSharesFromCounts(responseCounts)
    };
  });
}

export function buildRunOverview(params: {
  runId: string;
  projectId: string;
  startedAt: string;
  citations: CitationHitRaw[];
  mentions: MentionRaw[];
  prompts: PromptRaw[];
  brandVariants: string[];
}): RunOverview {
  const { runId, projectId, startedAt, citations, mentions, prompts, brandVariants } = params;

  const domains = new Set(citations.map((c) => c.page.registrable_domain).filter(Boolean));
  const neutralCount = citations.filter((c) => classifyCitation(c) === "neutral").length;
  const competitorMentions = mentions.filter((m) => {
    const bucket = classifyMention(m);
    return bucket === "competitor_only" || bucket === "both";
  }).length;

  const neutralSharePct = citations.length > 0 ? (neutralCount / citations.length) * 100 : 0;

  return {
    runId,
    createdAt: startedAt,
    projectId,
    totals: {
      citations: citations.length,
      uniqueDomains: domains.size,
      responses: mentions.length,
      neutralSharePct,
      competitorMentions
    },
    llms: buildLlmBreakdowns(citations, mentions),
    prompts: buildPromptResults(prompts, runId, citations, mentions),
    brandVariants
  };
}

export function aggregateNeutralDomains(citations: CitationHitRaw[], limit = 10): NeutralDomain[] {
  const neutralHits = citations.filter((c) => classifyCitation(c) === "neutral");
  const byDomain = new Map<string, number>();

  for (const hit of neutralHits) {
    const domain = hit.page.registrable_domain;
    if (!domain) {
      continue;
    }
    byDomain.set(domain, (byDomain.get(domain) ?? 0) + 1);
  }

  const total = neutralHits.length || 1;
  return Array.from(byDomain.entries())
    .map(([domain, docsCount]) => ({
      domain,
      docsCount,
      sharePct: (docsCount / total) * 100
    }))
    .sort((a, b) => b.docsCount - a.docsCount)
    .slice(0, limit);
}

export function aggregateCompetitors(citations: CitationHitRaw[], mentions: MentionRaw[]): CompetitorData[] {
  const byName = new Map<string, { citations: number; responses: number }>();

  for (const hit of citations) {
    if (!hit.flags?.is_competitor) {
      continue;
    }
    const names = hit.comp_hits?.by_name ?? hit.competitor_hits?.by_name ?? ["Competitor"];
    for (const name of names) {
      const entry = byName.get(name) ?? { citations: 0, responses: 0 };
      entry.citations += 1;
      byName.set(name, entry);
    }
  }

  for (const mention of mentions) {
    const names = mention.llm?.comp_hits?.by_name ?? mention.analysis?.competitor_hits?.by_name ?? [];
    for (const name of names) {
      const entry = byName.get(name) ?? { citations: 0, responses: 0 };
      entry.responses += 1;
      byName.set(name, entry);
    }
  }

  const totalCitations = citations.length || 1;
  const totalResponses = mentions.length || 1;

  return Array.from(byName.entries())
    .map(([name, counts]) => ({
      name,
      citationSharePct: (counts.citations / totalCitations) * 100,
      responseSharePct: (counts.responses / totalResponses) * 100
    }))
    .sort((a, b) => b.citationSharePct - a.citationSharePct);
}
