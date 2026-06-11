import type { AEOPrompt, BlogKeyword } from "./submit-types";

export function buildPromptText(blogTitle: string, keyword: BlogKeyword, aeoPrompt: AEOPrompt): string {
  return [
    keyword.keyword,
    `Search Intent: ${keyword.searchIntent}`,
    `Primary Product: ${keyword.primaryProduct}`,
    `Suggested Blog Title: ${keyword.suggestedBlogTitle}`,
    `AEO Question: ${keyword.aeoQuestion}`,
    `Content Angle: ${keyword.contentAngle}`,
    `Funnel Stage: ${keyword.funnelStage}`,
    `Internal Linking Target: ${keyword.internalLinkingTarget}`,
    "",
    "AI SEARCH PROMPT DATA:",
    `AI Prompt: ${aeoPrompt.prompt}`,
    `Prompt Category: ${aeoPrompt.promptCategory}`,
    `Platform Target: ${aeoPrompt.platform}`,
    `Buyer Persona: ${aeoPrompt.buyerPersona}`,
    `Opportunity Score: ${aeoPrompt.opportunityScore}`,
    `Suggested FAQ: ${aeoPrompt.suggestedFaq}`,
    "",
    "BLOG",
    blogTitle
  ].join("\n");
}

export function buildNotesText(keyword: BlogKeyword, aeoPrompt: AEOPrompt): string {
  return [
    `Target Keyword: ${keyword.keyword}`,
    `Suggested Blog Title: ${keyword.suggestedBlogTitle}`,
    `AEO Question: ${keyword.aeoQuestion}`,
    `Content Angle: ${keyword.contentAngle}`,
    `Funnel Stage: ${keyword.funnelStage}`,
    `Primary Product: ${keyword.primaryProduct}`,
    `Search Intent: ${keyword.searchIntent}`,
    `Internal Linking Target: ${keyword.internalLinkingTarget}`,
    `Opportunity Score: ${aeoPrompt.opportunityScore}`
  ].join("\n");
}
