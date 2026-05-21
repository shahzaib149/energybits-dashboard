import type {
  AeoPromptRecommendation,
  BlogSubmitInput,
  BlogSubmitWebhookPayload,
  KeywordRecommendation
} from "@/lib/blog-pipeline/submit-types";

function pick(...values: Array<string | undefined | null>): string {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return "";
}

export function mergeSubmitFields(
  input: BlogSubmitInput,
  keyword: KeywordRecommendation | null,
  aeo: AeoPromptRecommendation | null
): BlogSubmitWebhookPayload["fields"] {
  const o = input.overrides ?? {};
  return {
    blogTitle: pick(input.blogTitle, o.suggestedBlogTitle, keyword?.suggestedBlogTitle, aeo?.suggestedBlogTitle),
    targetKeyword: pick(o.targetKeyword, keyword?.keyword),
    searchIntent: pick(o.searchIntent, keyword?.searchIntent),
    primaryProduct: pick(o.primaryProduct, keyword?.primaryProduct),
    suggestedBlogTitle: pick(o.suggestedBlogTitle, keyword?.suggestedBlogTitle, aeo?.suggestedBlogTitle),
    aeoQuestion: pick(o.aeoQuestion, keyword?.aeoQuestion),
    contentAngle: pick(o.contentAngle, keyword?.contentAngle),
    funnelStage: pick(o.funnelStage, keyword?.funnelStage),
    internalLinkingTarget: pick(o.internalLinkingTarget, keyword?.internalLinkingTarget),
    aiPrompt: pick(o.aiPrompt, aeo?.prompt),
    promptCategory: pick(o.promptCategory, aeo?.promptCategory),
    platformTarget: pick(o.platformTarget, aeo?.platform),
    buyerPersona: pick(o.buyerPersona, aeo?.buyerPersona),
    opportunityScore: pick(o.opportunityScore, aeo?.opportunityScore?.toString()),
    suggestedFaq: pick(o.suggestedFaq, aeo?.suggestedFaq)
  };
}

export function buildPromptText(fields: BlogSubmitWebhookPayload["fields"]): string {
  const lines = [
    fields.targetKeyword,
    `Search Intent: ${fields.searchIntent}`,
    `Primary Product: ${fields.primaryProduct}`,
    `Suggested Blog Title: ${fields.suggestedBlogTitle}`,
    `AEO Question: ${fields.aeoQuestion}`,
    `Content Angle: ${fields.contentAngle}`,
    `Funnel Stage: ${fields.funnelStage}`,
    `Internal Linking Target: ${fields.internalLinkingTarget}`,
    "",
    "AI SEARCH PROMPT DATA:",
    `AI Prompt: ${fields.aiPrompt}`,
    `Prompt Category: ${fields.promptCategory}`,
    `Platform Target: ${fields.platformTarget}`,
    `Buyer Persona: ${fields.buyerPersona}`,
    `Opportunity Score: ${fields.opportunityScore}`,
    `Suggested FAQ: ${fields.suggestedFaq}`,
    "",
    "BLOG",
    fields.blogTitle
  ];
  return lines.join("\n");
}

export function fieldsToAirtable(
  fields: BlogSubmitWebhookPayload["fields"],
  authorEmail: string,
  linkIds?: { keywordId?: string; aeoPromptId?: string }
): Record<string, unknown> {
  const notes = [
    fields.targetKeyword ? `Target Keyword: ${fields.targetKeyword}` : "",
    fields.suggestedBlogTitle ? `Suggested Blog Title: ${fields.suggestedBlogTitle}` : "",
    fields.aeoQuestion ? `AEO Question: ${fields.aeoQuestion}` : "",
    fields.contentAngle ? `Content Angle: ${fields.contentAngle}` : "",
    fields.funnelStage ? `Funnel Stage: ${fields.funnelStage}` : "",
    fields.primaryProduct ? `Primary Product: ${fields.primaryProduct}` : "",
    fields.searchIntent ? `Search Intent: ${fields.searchIntent}` : "",
    fields.internalLinkingTarget ? `Internal Linking Target: ${fields.internalLinkingTarget}` : "",
    fields.opportunityScore ? `Opportunity Score: ${fields.opportunityScore}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const out: Record<string, unknown> = {
    "Blog Title": fields.blogTitle,
    // Airtable select options do not include "Creating"; webhook runs while status is Ready.
    "Blog Status": "Ready",
    "Author Name": authorEmail,
    Notes: notes || undefined,
    "AI Search Intent": fields.aiPrompt || undefined,
    "Prompt Category": fields.promptCategory || undefined,
    "Platform Target": fields.platformTarget || undefined,
    "Buyer Persona": fields.buyerPersona || undefined,
    "FAQ Section": fields.suggestedFaq || undefined,
    "Internal Product Links": fields.internalLinkingTarget || undefined
  };

  if (linkIds?.keywordId) {
    out["Related Keyword"] = [linkIds.keywordId];
  }
  if (linkIds?.aeoPromptId) {
    out["Related AEO Prompt"] = [linkIds.aeoPromptId];
  }

  return out;
}

export function buildSubmitWebhookPayload(
  recordId: string,
  input: BlogSubmitInput,
  keyword: KeywordRecommendation | null,
  aeo: AeoPromptRecommendation | null,
  triggeredBy: string,
  triggeredAt: string,
  airtableFields: Record<string, unknown>
): BlogSubmitWebhookPayload {
  const fields = mergeSubmitFields(input, keyword, aeo);
  return {
    event: "blog_creation_triggered",
    recordId,
    blogTitle: fields.blogTitle,
    triggeredBy,
    triggeredAt,
    keyword,
    aeoPrompt: aeo,
    promptText: buildPromptText(fields),
    fields,
    airtableFields
  };
}
