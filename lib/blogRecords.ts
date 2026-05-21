import { AirtableRecord, AirtableValue, BlogPipelineFields } from "@/lib/types";
import { asText } from "@/lib/utils";

type BlogRecord = AirtableRecord<BlogPipelineFields>;

const DATA_FIELDS: Array<keyof BlogPipelineFields | string> = [
  "Blog Title",
  "Blog Status",
  "URL Slug",
  "AI Draft",
  "Human Edited Draft",
  "Meta Title",
  "Meta Description",
  "H1",
  "H2 Structure",
  "FAQ Section",
  "Internal Product Links",
  "External Sources",
  "Featured Image Attachment",
  "Featured Image URL",
  "Featured Image File Name",
  "Alt Text",
  "Author Name",
  "Scheduled Publish Date",
  "Published Date",
  "CTA",
  "Prompt Category",
  "Platform Target",
  "Buyer Persona",
  "Notes"
];

function hasValue(value: AirtableValue) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return asText(value).trim().length > 0;
}

export function hasBlogPipelineData(record: BlogRecord) {
  return DATA_FIELDS.some((field) => hasValue(record.fields[field] as AirtableValue));
}

export function filterBlogPipelineRecords(records: BlogRecord[]) {
  return records.filter(hasBlogPipelineData);
}
