import {
  AirtableFieldSchema,
  AirtableTableSchema,
  EditableFieldDefinition,
  EditableFieldType,
  SelectChoice
} from "@/lib/types";

export const READONLY_FIELDS = [
  "Created Time",
  "Last Modified",
  "Id",
  "Blog Pipeline",
  "Related Keyword",
  "Repurposed Content",
  "Monthly Reports",
  "Related AEO Prompt",
  "Related Blog"
];

export type TableName =
  | "Keywords"
  | "Blog Pipeline"
  | "Product Pages"
  | "Repurposed Content"
  | "AEO Tracking"
  | "Monthly Reports"
  | "AEO Prompt Opportunities";

type TableConfig = {
  editableFields: EditableFieldDefinition[];
  createFields: string[];
};

function choiceList(names: string[]): SelectChoice[] {
  return names.map((name) => ({ name }));
}

export const TABLE_EDIT_CONFIG: Record<TableName, TableConfig> = {
  "Keywords": {
    editableFields: [
      { field: "Keyword", label: "Keyword", type: "singleLineText", required: true, create: true },
      { field: "Search Intent", label: "Search Intent", type: "singleSelect", create: true, options: choiceList(["Informational", "Commercial", "Transactional", "Navigational"]) },
      { field: "Primary Product", label: "Primary Product", type: "singleSelect", create: true, options: choiceList(["Skincare", "Hair Care", "Makeup", "Fragrance", "Bath & Body", "Nails", "Tools & Accessories", "Wellness", "Other"]) },
      { field: "Keyword Difficulty", label: "Keyword Difficulty", type: "number", precision: 0 },
      { field: "Search Volume", label: "Search Volume", type: "number", precision: 0 },
      { field: "Priority", label: "Priority", type: "singleSelect", create: true, options: choiceList(["High", "Medium", "Low"]) },
      { field: "Competitor", label: "Competitor", type: "singleLineText" },
      { field: "Suggested Blog Title", label: "Suggested Blog Title", type: "singleLineText" },
      { field: "AEO Question", label: "AEO Question", type: "multilineText" },
      { field: "Content Angle", label: "Content Angle", type: "multilineText" },
      { field: "Funnel Stage", label: "Funnel Stage", type: "singleLineText" },
      { field: "Status", label: "Status", type: "singleSelect" },
      { field: "Assigned Writer", label: "Assigned Writer", type: "singleLineText" },
      { field: "Target Publish Month", label: "Target Publish Month", type: "singleLineText" },
      { field: "Internal Linking Target", label: "Internal Linking Target", type: "singleLineText" },
      { field: "Notes", label: "Notes", type: "multilineText" }
    ],
    createFields: ["Keyword", "Search Intent", "Primary Product", "Priority"]
  },
  "Blog Pipeline": {
    editableFields: [
      { field: "Blog Title", label: "Blog Title", type: "singleLineText", required: true, create: true },
      { field: "Blog Status", label: "Blog Status", type: "singleSelect", create: true, options: choiceList(["Creating", "Ready", "Draft Generated", "Needs Review", "Revision Needed", "Approved", "Image Ready", "Shopify Draft Created", "Scheduled", "Published"]) },
      { field: "AI Draft", label: "AI Draft", type: "multilineText" },
      { field: "Human Edited Draft", label: "Human Edited Draft", type: "multilineText" },
      { field: "Meta Title", label: "Meta Title", type: "singleLineText" },
      { field: "Meta Description", label: "Meta Description", type: "multilineText" },
      { field: "URL Slug", label: "URL Slug", type: "singleLineText" },
      { field: "H1", label: "H1", type: "singleLineText" },
      { field: "H2 Structure", label: "H2 Structure", type: "multilineText" },
      { field: "FAQ Section", label: "FAQ Section", type: "multilineText" },
      { field: "Internal Product Links", label: "Internal Product Links", type: "multilineText" },
      { field: "External Sources", label: "External Sources", type: "multilineText" },
      { field: "Shopify Article URL", label: "Shopify Article URL", type: "url" },
      { field: "WordPress URL", label: "WordPress URL", type: "url" },
      { field: "Featured Image Prompt", label: "Featured Image Prompt", type: "multilineText" },
      { field: "Featured Image URL", label: "Featured Image URL", type: "url" },
      { field: "Featured Image File Name", label: "Featured Image File Name", type: "singleLineText" },
      { field: "Alt Text", label: "Alt Text", type: "singleLineText" },
      { field: "Image Generation Status", label: "Image Generation Status", type: "singleLineText" },
      { field: "Image Source", label: "Image Source", type: "singleLineText" },
      { field: "Author Name", label: "Author Name", type: "singleLineText", create: true },
      { field: "Scheduled Publish Date", label: "Scheduled Publish Date", type: "date" },
      { field: "Published Date", label: "Published Date", type: "date" },
      { field: "CTA", label: "CTA", type: "multilineText" },
      { field: "Schema Type", label: "Schema Type", type: "singleLineText" },
      { field: "SEO Score", label: "SEO Score", type: "number", precision: 0 },
      { field: "AEO Optimization Score", label: "AEO Optimization Score", type: "number", precision: 0 },
      { field: "GEO Optimization Score", label: "GEO Optimization Score", type: "number", precision: 0 },
      { field: "Notes", label: "Notes", type: "multilineText" },
      { field: "AI Search Intent", label: "AI Search Intent", type: "singleLineText" },
      { field: "Prompt Category", label: "Prompt Category", type: "singleLineText" },
      { field: "Platform Target", label: "Platform Target", type: "singleSelect", options: choiceList(["ChatGPT", "Perplexity", "Gemini", "Claude", "Google AI Overview"]) },
      { field: "Buyer Persona", label: "Buyer Persona", type: "singleLineText" }
    ],
    createFields: ["Blog Title", "Blog Status", "Author Name"]
  },
  "Product Pages": {
    editableFields: [
      { field: "Product Name", label: "Product Name", type: "singleLineText", required: true, create: true },
      { field: "Product URL", label: "Product URL", type: "url", create: true },
      { field: "Product Category", label: "Product Category", type: "singleLineText", create: true },
      { field: "Existing Meta Title", label: "Existing Meta Title", type: "singleLineText" },
      { field: "Existing Meta Description", label: "Existing Meta Description", type: "multilineText" },
      { field: "Improved Meta Title", label: "Improved Meta Title", type: "singleLineText" },
      { field: "Improved Meta Description", label: "Improved Meta Description", type: "multilineText" },
      { field: "Product FAQ", label: "Product FAQ", type: "multilineText" },
      { field: "Product Schema", label: "Product Schema", type: "multilineText" },
      { field: "AEO Questions", label: "AEO Questions", type: "multilineText" },
      { field: "Internal Linking Opportunities", label: "Internal Linking Opportunities", type: "multilineText" },
      { field: "Competitor Comparison", label: "Competitor Comparison", type: "multilineText" },
      { field: "SEO Status", label: "SEO Status", type: "singleSelect", options: choiceList(["Optimized", "Pending", "Needs Update"]) },
      { field: "Notes", label: "Notes", type: "multilineText" }
    ],
    createFields: ["Product Name", "Product URL", "Product Category"]
  },
  "Repurposed Content": {
    editableFields: [
      { field: "Content Status", label: "Content Status", type: "singleSelect", create: true, options: choiceList(["Pending", "Generated", "Approved", "Published"]) },
      { field: "Instagram Caption", label: "Instagram Caption", type: "multilineText" },
      { field: "Facebook Post", label: "Facebook Post", type: "multilineText" },
      { field: "Reel Script", label: "Reel Script", type: "multilineText" },
      { field: "Email Snippet", label: "Email Snippet", type: "multilineText" },
      { field: "Ad Copy", label: "Ad Copy", type: "multilineText" },
      { field: "Hashtags", label: "Hashtags", type: "multipleSelects" },
      { field: "CTA", label: "CTA", type: "multilineText" },
      { field: "Google Drive Folder", label: "Google Drive Folder", type: "url" },
      { field: "Canva Link", label: "Canva Link", type: "url" },
      { field: "Notes", label: "Notes", type: "multilineText" }
    ],
    createFields: ["Content Status"]
  },
  "AEO Tracking": {
    editableFields: [
      { field: "Query Prompt", label: "Query Prompt", type: "multilineText", required: true, create: true },
      { field: "Platform", label: "Platform", type: "singleSelect", create: true, options: choiceList(["ChatGPT", "Perplexity", "Gemini", "Claude", "Google AI Overview"]) },
      { field: "Product Mentioned", label: "Product Mentioned", type: "checkbox" },
      { field: "Citation URL", label: "Citation URL", type: "url" },
      { field: "Competitor Mentioned", label: "Competitor Mentioned", type: "singleLineText" },
      { field: "Ranking Position", label: "Ranking Position", type: "number", precision: 0 },
      { field: "AI Response Summary", label: "AI Response Summary", type: "multilineText" },
      { field: "Screenshot URL", label: "Screenshot URL", type: "url" },
      { field: "Test Date", label: "Test Date", type: "date", create: true },
      { field: "Status", label: "Status", type: "singleSelect", options: choiceList(["Tracking", "Improved", "Declined"]) },
      { field: "Notes", label: "Notes", type: "multilineText" }
    ],
    createFields: ["Query Prompt", "Platform", "Test Date"]
  },
  "Monthly Reports": {
    editableFields: [
      { field: "Total Blogs Published", label: "Total Blogs Published", type: "number", precision: 0 },
      { field: "Total Keywords Ranked", label: "Total Keywords Ranked", type: "number", precision: 0 },
      { field: "Organic Traffic", label: "Organic Traffic", type: "number", precision: 0 },
      { field: "AI Mentions", label: "AI Mentions", type: "number", precision: 0 },
      { field: "SEO Summary", label: "SEO Summary", type: "multilineText" },
      { field: "AEO Summary", label: "AEO Summary", type: "multilineText" },
      { field: "GEO Summary", label: "GEO Summary", type: "multilineText" },
      { field: "Recommendations", label: "Recommendations", type: "multilineText" },
      { field: "PDF Report URL", label: "PDF Report URL", type: "url" },
      { field: "Notes", label: "Notes", type: "multilineText" },
      { field: "Report Month", label: "Report Month", type: "singleLineText", required: true, create: true }
    ],
    createFields: ["Report Month"]
  },
  "AEO Prompt Opportunities": {
    editableFields: [
      { field: "Prompt", label: "Prompt", type: "multilineText", required: true, create: true },
      { field: "Prompt Category", label: "Prompt Category", type: "singleLineText", create: true },
      { field: "Platform", label: "Platform", type: "singleSelect", options: choiceList(["ChatGPT", "Perplexity", "Gemini", "Claude", "Google AI Overview"]) },
      { field: "Buyer Persona", label: "Buyer Persona", type: "singleLineText" },
      { field: "Brand Mention %", label: "Brand Mention %", type: "number", precision: 0 },
      { field: "Competitor Mention %", label: "Competitor Mention %", type: "number", precision: 0 },
      { field: "Opportunity Score", label: "Opportunity Score", type: "number", precision: 0 },
      { field: "Suggested Content Type", label: "Suggested Content Type", type: "singleLineText" },
      { field: "Suggested Blog Title", label: "Suggested Blog Title", type: "singleLineText" },
      { field: "Suggested FAQ", label: "Suggested FAQ", type: "multilineText" },
      { field: "Related Product", label: "Related Product", type: "singleLineText" },
      { field: "Funnel Stage", label: "Funnel Stage", type: "singleLineText" },
      { field: "Competitor", label: "Competitor", type: "singleLineText" },
      { field: "Status", label: "Status", type: "singleLineText" },
      { field: "Priority", label: "Priority", type: "singleSelect", create: true, options: choiceList(["High", "Medium", "Low"]) },
      { field: "Notes", label: "Notes", type: "multilineText" }
    ],
    createFields: ["Prompt", "Prompt Category", "Priority"]
  }
};

export function getTableConfig(tableName: TableName) {
  return TABLE_EDIT_CONFIG[tableName];
}

export function getEditableDefinition(tableName: TableName, fieldName: string) {
  return TABLE_EDIT_CONFIG[tableName].editableFields.find((field) => field.field === fieldName);
}

export function getCreateDefinitions(tableName: TableName, fieldDefinitions?: EditableFieldDefinition[]) {
  const { editableFields, createFields } = TABLE_EDIT_CONFIG[tableName];
  const sourceFields = fieldDefinitions ?? editableFields;
  return createFields
    .map((name) => sourceFields.find((field) => field.field === name))
    .filter(Boolean) as EditableFieldDefinition[];
}

export function convertFieldValue(fieldDef: EditableFieldDefinition, value: unknown): unknown {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  switch (fieldDef.type) {
    case "number":
      const numValue = typeof value === "string" ? Number.parseFloat(value) : Number(value);
      return isNaN(numValue) ? undefined : numValue;
    case "date":
    case "dateTime":
      // Assume value is already in ISO format or convert if needed
      return value;
    case "checkbox":
      return Boolean(value);
    case "singleSelect":
    case "multipleSelects":
    case "singleLineText":
    case "multilineText":
    case "url":
    default:
      return value;
  }
}

export function getFieldOptions(fieldDef: EditableFieldDefinition): string[] {
  if (fieldDef.options) {
    return fieldDef.options.map(option => option.name);
  }
  return [];
}

export function validateFieldValue(fieldDef: EditableFieldDefinition, value: unknown): { valid: boolean; error?: string } {
  if (fieldDef.required && (value === "" || value === undefined || value === null)) {
    return { valid: false, error: `${fieldDef.label} is required` };
  }

  if (fieldDef.type === "singleSelect" && fieldDef.options && value) {
    const validOptions = fieldDef.options.map(option => option.name);
    if (!validOptions.includes(String(value))) {
      return { valid: false, error: `${fieldDef.label} must be one of: ${validOptions.join(", ")}` };
    }
  }

  if (fieldDef.type === "number" && value !== undefined && value !== "") {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return { valid: false, error: `${fieldDef.label} must be a valid number` };
    }
  }

  return { valid: true };
}

export function mergeSchemaChoices(
  tableName: TableName,
  schema: AirtableTableSchema | null
): EditableFieldDefinition[] {
  const config = TABLE_EDIT_CONFIG[tableName];
  if (!schema) {
    return config.editableFields;
  }

  return config.editableFields.map((field) => {
    const schemaField = schema.fields.find((entry) => entry.name === field.field);
    const resolvedType = schemaFieldType(schemaField);
    const schemaChoices = schemaField?.options?.choices?.map((choice) => ({
      name: choice.name,
      color: choice.color
    }));

    return {
      ...field,
      type: resolvedType ?? field.type,
      options: schemaChoices && schemaChoices.length > 0 ? schemaChoices : field.options
    };
  });
}

export function schemaFieldType(schemaField?: AirtableFieldSchema): EditableFieldType | null {
  if (!schemaField) {
    return null;
  }

  switch (schemaField.type) {
    case "singleLineText":
    case "multilineText":
    case "singleSelect":
    case "multipleSelects":
    case "number":
    case "date":
    case "dateTime":
    case "checkbox":
    case "url":
      return schemaField.type;
    default:
      return null;
  }
}
