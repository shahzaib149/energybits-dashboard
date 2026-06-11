import type { AEOPrompt, BlogKeyword } from "./submit-types";

function overlap(title: string, text: string): number {
  if (!title || !text) return 0;
  const titleWords = new Set(title.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  let score = 0;
  for (const word of text.toLowerCase().split(/\W+/)) {
    if (titleWords.has(word)) score++;
  }
  return score;
}

export function rankKeywords(title: string, keywords: BlogKeyword[]): BlogKeyword[] {
  const q = title.trim();
  return [...keywords]
    .map((kw) => ({
      kw,
      score: overlap(q, kw.keyword) * 2 + overlap(q, kw.suggestedBlogTitle)
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.kw);
}

export function rankAEOPrompts(title: string, prompts: AEOPrompt[]): AEOPrompt[] {
  const q = title.trim();
  return [...prompts]
    .map((p) => ({
      p,
      score:
        overlap(q, p.prompt) * 2 +
        overlap(q, p.suggestedBlogTitle) +
        p.opportunityScore / 200
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
