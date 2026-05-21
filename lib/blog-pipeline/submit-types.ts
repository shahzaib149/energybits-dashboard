export interface KeywordRecommendation {
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

export interface AeoPromptRecommendation {
  id: string;
  prompt: string;
  promptCategory: string;
  platform: string;
  buyerPersona: string;
  opportunityScore: number | null;
  suggestedFaq: string;
  suggestedBlogTitle: string;
}

export interface BlogSubmitInput {
  blogTitle: string;
  keywordId?: string;
  aeoPromptId?: string;
  /** Manual overrides when user edits pre-filled fields */
  overrides?: Partial<{
    targetKeyword: string;
    searchIntent: string;
    primaryProduct: string;
    suggestedBlogTitle: string;
    aeoQuestion: string;
    contentAngle: string;
    funnelStage: string;
    internalLinkingTarget: string;
    aiPrompt: string;
    promptCategory: string;
    platformTarget: string;
    buyerPersona: string;
    opportunityScore: string;
    suggestedFaq: string;
  }>;
}

export interface BlogSubmitWebhookPayload {
  event: "blog_creation_triggered";
  recordId: string;
  blogTitle: string;
  triggeredBy: string;
  triggeredAt: string;
  keyword: KeywordRecommendation | null;
  aeoPrompt: AeoPromptRecommendation | null;
  promptText: string;
  fields: {
    blogTitle: string;
    targetKeyword: string;
    searchIntent: string;
    primaryProduct: string;
    suggestedBlogTitle: string;
    aeoQuestion: string;
    contentAngle: string;
    funnelStage: string;
    internalLinkingTarget: string;
    aiPrompt: string;
    promptCategory: string;
    platformTarget: string;
    buyerPersona: string;
    opportunityScore: string;
    suggestedFaq: string;
  };
  airtableFields: Record<string, unknown>;
}
