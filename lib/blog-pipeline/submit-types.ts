export interface BlogKeyword {
  id: string;
  keyword: string;
  searchIntent: string;
  primaryProduct: string;
  suggestedBlogTitle: string;
  aeoQuestion: string;
  contentAngle: string;
  funnelStage: string;
  internalLinkingTarget: string;
}

export interface AEOPrompt {
  id: string;
  prompt: string;
  promptCategory: string;
  platform: string;
  buyerPersona: string;
  opportunityScore: number;
  suggestedFaq: string;
  suggestedBlogTitle: string;
}

export interface SubmitTopicRequest {
  blogTitle: string;
  keyword: BlogKeyword;
  aeoPrompt: AEOPrompt;
}

export interface SubmitTopicResponse {
  recordId: string;
  blogTitle: string;
  warning?: string;
}

export interface RecommendationsResponse {
  keywords: BlogKeyword[];
  aeoPrompts: AEOPrompt[];
}

// ─── Airtable mappers ─────────────────────────────────────────────────────────

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function mapBlogKeyword(record: { id: string; fields: Record<string, unknown> }): BlogKeyword {
  const f = record.fields;
  return {
    id: record.id,
    keyword: str(f.Keyword),
    searchIntent: str(f["Search Intent"]),
    primaryProduct: str(f["Primary Product"]),
    suggestedBlogTitle: str(f["Suggested Blog Title"]),
    aeoQuestion: str(f["AEO Question"]),
    contentAngle: str(f["Content Angle"]),
    funnelStage: str(f["Funnel Stage"]),
    internalLinkingTarget: str(f["Internal Linking Target"])
  };
}

export function mapAEOPrompt(record: { id: string; fields: Record<string, unknown> }): AEOPrompt {
  const f = record.fields;
  return {
    id: record.id,
    prompt: str(f.Prompt ?? f["AI Search Prompt"] ?? f["Prompt Text"]),
    promptCategory: str(f["Prompt Category"]),
    platform: str(f.Platform ?? f["Platform Target"]),
    buyerPersona: str(f["Buyer Persona"]),
    opportunityScore: num(f["Opportunity Score"]),
    suggestedFaq: str(f["Suggested FAQ"]),
    suggestedBlogTitle: str(f["Suggested Blog Title"])
  };
}
