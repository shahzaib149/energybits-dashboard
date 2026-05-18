export type AirtablePrimitive = string | number | boolean | null | undefined;
export type AirtableValue =
  | AirtablePrimitive
  | string[]
  | number[]
  | boolean[]
  | Record<string, unknown>
  | Record<string, unknown>[];

export interface AirtableRecord<T extends Record<string, AirtableValue>> {
  id: string;
  createdTime: string;
  fields: T;
}

export interface AirtableAttachment {
  [key: string]: unknown;
  id?: string;
  url?: string;
  filename?: string;
  type?: string;
  size?: number;
  thumbnails?: Record<string, { url?: string; width?: number; height?: number }>;
}

export type EditableFieldType =
  | "singleLineText"
  | "multilineText"
  | "singleSelect"
  | "multipleSelects"
  | "number"
  | "date"
  | "dateTime"
  | "checkbox"
  | "url";

export interface AirtableFieldSchema {
  name: string;
  type: string;
  options?: {
    choices?: Array<{
      id?: string;
      name: string;
      color?: string;
    }>;
    precision?: number;
  };
}

export interface AirtableTableSchema {
  tableName: string;
  fields: AirtableFieldSchema[];
}

export interface SelectChoice {
  name: string;
  color?: string;
}

export interface EditableFieldDefinition {
  field: string;
  label: string;
  type: EditableFieldType;
  required?: boolean;
  create?: boolean;
  precision?: number;
  options?: SelectChoice[];
}

export interface KeywordsFields {
  [key: string]: AirtableValue;
  Keyword?: string;
  "Search Intent"?: string;
  "Primary Product"?: string;
  "Search Volume"?: number;
  "Keyword Difficulty"?: number;
  Priority?: string;
  Status?: string;
  "Assigned Writer"?: string;
  "Target Publish Month"?: string;
}

export interface BlogPipelineFields {
  "Blog Title"?: string;
  "URL Slug"?: string;
  "Blog Status"?: string;
  "Image Generation Status"?: string;
  "Image Source"?: string;
  "Featured Image Attachment"?: AirtableAttachment[] | Record<string, unknown>[];
  "Featured Image URL"?: string;
  "Featured Image File Name"?: string;
  "Alt Text"?: string;
  "Prompt Category"?: string;
  "Platform Target"?: string;
  "Buyer Persona"?: string;
  "SEO Score"?: number;
  "AEO Optimization Score"?: number;
  "GEO Optimization Score"?: number;
  "Scheduled Publish Date"?: string;
  "Author Name"?: string;
  "AI Draft"?: string;
  "Human Edited Draft"?: string;
  [key: string]: AirtableValue;
}

export interface ProductPagesFields {
  [key: string]: AirtableValue;
  "Product Name"?: string;
  "Product URL"?: string;
  "Product Category"?: string;
  "SEO Status"?: string;
  "Existing Meta Title"?: string;
  "Improved Meta Title"?: string;
  "Existing Meta Description"?: string;
  "Improved Meta Description"?: string;
  "Last Modified"?: string;
}

export interface RepurposedContentFields {
  [key: string]: AirtableValue;
  Id?: string | number;
  "Content Status"?: string;
  "Instagram Caption"?: string;
  "Facebook Post"?: string;
  "Reel Script"?: string;
  Reel?: string;
  "Email Snippet"?: string;
  "Ad Copy"?: string;
  Hashtags?: string | string[];
  "Last Modified"?: string;
}

export interface AEOTrackingFields {
  [key: string]: AirtableValue;
  "Query Prompt"?: string;
  Platform?: string;
  "Product Mentioned"?: boolean;
  "Ranking Position"?: number;
  "Competitor Mentioned"?: string;
  Status?: string;
  "Test Date"?: string;
  "AI Response Summary"?: string;
}

export interface MonthlyReportsFields {
  [key: string]: AirtableValue;
  "Report Month"?: string;
  "Total Blogs Published"?: number;
  "Total Keywords Ranked"?: number;
  "Organic Traffic"?: number;
  "AI Mentions"?: number;
  "SEO Summary"?: string;
  "AEO Summary"?: string;
  "GEO Summary"?: string;
  Recommendations?: string;
  "PDF Report URL"?: string;
}

export interface AEOPromptOpportunityFields {
  [key: string]: AirtableValue;
  Prompt?: string;
  "Prompt Category"?: string;
  Platform?: string;
  "Buyer Persona"?: string;
  "Opportunity Score"?: number;
  "Brand Mention %"?: number;
  "Competitor Mention %"?: number;
  "Suggested Content Type"?: string;
  Priority?: string;
  Status?: string;
}
