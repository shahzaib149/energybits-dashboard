import type { AeoPromptRecommendation, KeywordRecommendation } from "@/lib/blog-pipeline/submit-types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "your",
  "from",
  "this",
  "what",
  "how",
  "are",
  "can",
  "does",
  "best",
  "about"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function scoreAgainstTopic(topicTokens: string[], topicLower: string, ...parts: string[]): number {
  const haystack = parts.filter(Boolean).join(" ").toLowerCase();
  if (!haystack) return 0;

  let score = 0;
  for (const token of topicTokens) {
    if (haystack.includes(token)) score += 2;
  }

  if (topicLower.length > 4 && haystack.includes(topicLower)) {
    score += 8;
  }

  const topicWords = topicLower.split(/\s+/).filter((w) => w.length > 3);
  for (const word of topicWords) {
    if (haystack.includes(word)) score += 1;
  }

  return score;
}

function bestMatch<T extends { id: string }>(
  items: T[],
  scoreFn: (item: T) => number
): { item: T | null; score: number } {
  let best: T | null = null;
  let bestScore = 0;

  for (const item of items) {
    const score = scoreFn(item);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return { item: bestScore > 0 ? best : null, score: bestScore };
}

export function matchKeywordForTopic(
  topic: string,
  keywords: KeywordRecommendation[]
): KeywordRecommendation | null {
  const trimmed = topic.trim();
  if (!trimmed) return null;

  const tokens = tokenize(trimmed);
  const topicLower = trimmed.toLowerCase();

  return bestMatch(keywords, (k) =>
    scoreAgainstTopic(
      tokens,
      topicLower,
      k.keyword,
      k.suggestedBlogTitle,
      k.contentAngle,
      k.aeoQuestion,
      k.funnelStage
    )
  ).item;
}

export function matchAeoPromptForTopic(
  topic: string,
  aeoPrompts: AeoPromptRecommendation[]
): AeoPromptRecommendation | null {
  const trimmed = topic.trim();
  if (!trimmed) return null;

  const tokens = tokenize(trimmed);
  const topicLower = trimmed.toLowerCase();

  return bestMatch(aeoPrompts, (p) => {
    const base = scoreAgainstTopic(
      tokens,
      topicLower,
      p.prompt,
      p.suggestedBlogTitle,
      p.suggestedFaq,
      p.promptCategory,
      p.buyerPersona
    );
    const opportunityBonus = (p.opportunityScore ?? 0) / 100;
    return base + opportunityBonus;
  }).item;
}

export function matchRecommendationsForTopic(
  topic: string,
  keywords: KeywordRecommendation[],
  aeoPrompts: AeoPromptRecommendation[]
) {
  return {
    keyword: matchKeywordForTopic(topic, keywords),
    aeoPrompt: matchAeoPromptForTopic(topic, aeoPrompts)
  };
}
