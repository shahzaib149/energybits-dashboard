import type { AirtableRecordRaw } from "@/lib/airtable/types";

export type BlogStatus =
  | "Ready"
  | "Draft Generated"
  | "Needs Review"
  | "Revision Needed"
  | "Approved"
  | "Image Ready"
  | "Shopify Draft Created"
  | "Scheduled"
  | "Published";

export interface BlogPipelineRow {
  id: string;
  blogTitle: string;
  suggestedBlogTitle: string;
  targetKeyword: string;
  aeoQuestion: string;
  funnelStage: string;
  primaryProduct: string;
  notes: string;
  blogStatus: BlogStatus;
  submittedBy: string;
  createdTime: string;
  lastModified: string;
}

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asBlogStatus(value: unknown): BlogStatus {
  const text = asString(value);
  const allowed: BlogStatus[] = [
    "Ready",
    "Draft Generated",
    "Needs Review",
    "Revision Needed",
    "Approved",
    "Image Ready",
    "Shopify Draft Created",
    "Scheduled",
    "Published"
  ];
  return (allowed.includes(text as BlogStatus) ? text : "Ready") as BlogStatus;
}

export function mapBlogPipelineRecord(record: AirtableRecordRaw): BlogPipelineRow {
  const f = record.fields;
  return {
    id: record.id,
    blogTitle: asString(f["Blog Title"]),
    suggestedBlogTitle: asString(f["Suggested Blog Title"]),
    targetKeyword: asString(f["Target Keyword"]),
    aeoQuestion: asString(f["AEO Question"]),
    funnelStage: asString(f["Funnel Stage"]),
    primaryProduct: asString(f["Primary Product"]),
    notes: asString(f.Notes),
    blogStatus: asBlogStatus(f["Blog Status"]),
    submittedBy: asString(f["Submitted By"] || f["Author Name"]),
    createdTime: asString(f["Created Time"]),
    lastModified: asString(f["Last Modified"])
  };
}

export const BLOG_PIPELINE_TABLE = "Blog Pipeline";

export const EDITABLE_BLOG_FIELDS = [
  "Blog Title",
  "Suggested Blog Title",
  "Target Keyword",
  "AEO Question",
  "Funnel Stage",
  "Primary Product",
  "Notes"
] as const;

export type EditableBlogField = (typeof EDITABLE_BLOG_FIELDS)[number];

export function blogFieldsToAirtable(row: Partial<BlogPipelineRow>): Record<string, string> {
  const out: Record<string, string> = {};
  if (row.blogTitle !== undefined) out["Blog Title"] = row.blogTitle;
  if (row.suggestedBlogTitle !== undefined) out["Suggested Blog Title"] = row.suggestedBlogTitle;
  if (row.targetKeyword !== undefined) out["Target Keyword"] = row.targetKeyword;
  if (row.aeoQuestion !== undefined) out["AEO Question"] = row.aeoQuestion;
  if (row.funnelStage !== undefined) out["Funnel Stage"] = row.funnelStage;
  if (row.primaryProduct !== undefined) out["Primary Product"] = row.primaryProduct;
  if (row.notes !== undefined) out["Notes"] = row.notes;
  return out;
}

export const statusColors: Record<BlogStatus, string> = {
  Ready: "bg-gray-500/20 text-gray-300",
  "Draft Generated": "bg-blue-500/20 text-blue-300",
  "Needs Review": "bg-amber-500/20 text-amber-300",
  "Revision Needed": "bg-red-500/20 text-red-300",
  Approved: "bg-green-500/20 text-green-300",
  "Image Ready": "bg-emerald-500/20 text-emerald-300",
  "Shopify Draft Created": "bg-purple-500/20 text-purple-300",
  Scheduled: "bg-indigo-500/20 text-indigo-300",
  Published: "bg-brand/20 text-brand"
};
