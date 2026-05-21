import { fetchTable } from "@/lib/airtable";
import type { AeoPromptRecommendation, KeywordRecommendation } from "@/lib/blog-pipeline/submit-types";
import { AEOPromptOpportunityFields, AirtableRecord, KeywordsFields } from "@/lib/types";
import { asText } from "@/lib/utils";

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function mapKeywordRecord(record: AirtableRecord<KeywordsFields>): KeywordRecommendation {
  const f = record.fields;
  return {
    id: record.id,
    keyword: asText(f.Keyword),
    searchIntent: asText(f["Search Intent"]),
    primaryProduct: asText(f["Primary Product"]),
    suggestedBlogTitle: asText(f["Suggested Blog Title"]),
    aeoQuestion: asText(f["AEO Question"]),
    contentAngle: asText(f["Content Angle"]),
    funnelStage: asText(f["Funnel Stage"]),
    internalLinkingTarget: asText(f["Internal Linking Target"])
  };
}

export function mapAeoPromptRecord(
  record: AirtableRecord<AEOPromptOpportunityFields>
): AeoPromptRecommendation {
  const f = record.fields;
  return {
    id: record.id,
    prompt: asText(f.Prompt),
    promptCategory: asText(f["Prompt Category"]),
    platform: asText(f.Platform),
    buyerPersona: asText(f["Buyer Persona"]),
    opportunityScore: asNumber(f["Opportunity Score"]),
    suggestedFaq: asText(f["Suggested FAQ"]),
    suggestedBlogTitle: asText(f["Suggested Blog Title"])
  };
}

export async function fetchBlogRecommendations() {
  const [keywords, aeoPrompts] = await Promise.all([
    fetchTable<KeywordsFields>("Keywords"),
    fetchTable<AEOPromptOpportunityFields>("AEO Prompt Opportunities")
  ]);

  return {
    keywords: keywords.map(mapKeywordRecord).filter((k) => k.keyword),
    aeoPrompts: aeoPrompts.map(mapAeoPromptRecord).filter((p) => p.prompt)
  };
}

export function findKeywordById(keywords: KeywordRecommendation[], id?: string) {
  if (!id) return null;
  return keywords.find((k) => k.id === id) ?? null;
}

export function findAeoById(aeoPrompts: AeoPromptRecommendation[], id?: string) {
  if (!id) return null;
  return aeoPrompts.find((p) => p.id === id) ?? null;
}
