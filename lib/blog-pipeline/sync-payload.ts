import { getBlogPreviewSource } from "@/lib/blogPreview";
import { getBlogPreviewImage } from "@/lib/blogImages";
import { AirtableAttachment, AirtableRecord, AirtableValue, BlogPipelineFields } from "@/lib/types";
import { asText } from "@/lib/utils";

export type BlogWebhookEvent = "content_updated" | "publish_triggered";

export interface BlogSyncWebhookPayload {
  event: BlogWebhookEvent;
  recordId: string;
  triggeredBy: string;
  triggeredAt: string;
  fieldsChanged: string[];
  content: {
    blogTitle: string;
    metaTitle: string;
    metaDescription: string;
    h1: string;
    h2Structure: string;
    faqSection: string;
    cta: string;
    aiDraft: string;
    humanEditedDraft: string;
    bodyContent: string;
    urlSlug: string;
    altText: string;
    featuredImageUrl: string;
    featuredImageFileName: string;
    blogStatus: string;
    authorName: string;
    internalProductLinks: string;
    externalSources: string;
    schemaType: string;
    seoScore: number | null;
    aeoOptimizationScore: number | null;
    geoOptimizationScore: number | null;
    scheduledPublishDate: string;
    publishedDate: string;
    shopifyArticleUrl: string;
    wordpressUrl: string;
    imageGenerationStatus: string;
    promptCategory: string;
    platformTarget: string;
    buyerPersona: string;
  };
  airtableFields: Record<string, unknown>;
}

function asNumber(value: AirtableValue): number | null {
  if (value == null || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function serializeAttachment(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const attachment = value as AirtableAttachment;
  if (typeof attachment.url !== "string") return value;
  return {
    id: attachment.id,
    url: attachment.url,
    filename: attachment.filename,
    type: attachment.type,
    size: attachment.size
  };
}

function serializeFieldValue(value: AirtableValue): unknown {
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === "object" && value[0] !== null && "url" in value[0]) {
      return value.map(serializeAttachment);
    }
    return value;
  }
  return value ?? "";
}

type BlogRecordForSync = Pick<AirtableRecord<BlogPipelineFields>, "id" | "fields">;

export function buildBlogSyncPayload(
  record: BlogRecordForSync,
  opts: {
    event: BlogWebhookEvent;
    triggeredBy: string;
    triggeredAt: string;
    fieldsChanged?: string[];
  }
): BlogSyncWebhookPayload {
  const previewImage = getBlogPreviewImage(record as AirtableRecord<BlogPipelineFields>);
  const bodyContent = getBlogPreviewSource(record as AirtableRecord<BlogPipelineFields>);

  const airtableFields = Object.fromEntries(
    Object.entries(record.fields).map(([key, value]) => [key, serializeFieldValue(value)])
  );

  return {
    event: opts.event,
    recordId: record.id,
    triggeredBy: opts.triggeredBy,
    triggeredAt: opts.triggeredAt,
    fieldsChanged: opts.fieldsChanged ?? [],
    content: {
      blogTitle: asText(record.fields["Blog Title"]),
      metaTitle: asText(record.fields["Meta Title"]),
      metaDescription: asText(record.fields["Meta Description"]),
      h1: asText(record.fields.H1),
      h2Structure: asText(record.fields["H2 Structure"]),
      faqSection: asText(record.fields["FAQ Section"]),
      cta: asText(record.fields.CTA),
      aiDraft: asText(record.fields["AI Draft"]),
      humanEditedDraft: asText(record.fields["Human Edited Draft"]),
      bodyContent,
      urlSlug: asText(record.fields["URL Slug"]),
      altText: asText(record.fields["Alt Text"]),
      featuredImageUrl: previewImage?.url || asText(record.fields["Featured Image URL"]),
      featuredImageFileName:
        previewImage?.fileName || asText(record.fields["Featured Image File Name"]),
      blogStatus: asText(record.fields["Blog Status"]),
      authorName: asText(record.fields["Author Name"]),
      internalProductLinks: asText(record.fields["Internal Product Links"]),
      externalSources: asText(record.fields["External Sources"]),
      schemaType: asText(record.fields["Schema Type"]),
      seoScore: asNumber(record.fields["SEO Score"]),
      aeoOptimizationScore: asNumber(record.fields["AEO Optimization Score"]),
      geoOptimizationScore: asNumber(record.fields["GEO Optimization Score"]),
      scheduledPublishDate: asText(record.fields["Scheduled Publish Date"]),
      publishedDate: asText(record.fields["Published Date"]),
      shopifyArticleUrl: asText(record.fields["Shopify Article URL"]),
      wordpressUrl: asText(record.fields["WordPress URL"]),
      imageGenerationStatus: asText(record.fields["Image Generation Status"]),
      promptCategory: asText(record.fields["Prompt Category"]),
      platformTarget: asText(record.fields["Platform Target"]),
      buyerPersona: asText(record.fields["Buyer Persona"])
    },
    airtableFields
  };
}
