import { AirtableAttachment, AirtableRecord, BlogPipelineFields } from "@/lib/types";
import { asText } from "@/lib/utils";

type BlogRecord = AirtableRecord<BlogPipelineFields>;

/** Show featured image once AI draft exists (from Draft Generated onward). */
const IMAGE_VISIBLE_STATUSES = new Set([
  "Draft Generated",
  "Needs Review",
  "Revision Needed",
  "Approved",
  "Image Ready",
  "Shopify Draft Created",
  "Scheduled",
  "Published"
]);

interface BlogPreviewImage {
  url: string;
  alt: string;
  fileName?: string;
  source: "attachment" | "url";
}

interface ShopifyArticleImage {
  url: string;
  altText?: string;
}

function isAttachment(value: unknown): value is AirtableAttachment {
  return Boolean(value && typeof value === "object" && "url" in value && typeof (value as AirtableAttachment).url === "string");
}

export function shouldShowBlogImage(record: BlogRecord) {
  return IMAGE_VISIBLE_STATUSES.has(asText(record.fields["Blog Status"]));
}

export function getFeaturedImageAttachment(record: BlogRecord): AirtableAttachment | null {
  const attachments = record.fields["Featured Image Attachment"];

  if (!Array.isArray(attachments)) {
    return null;
  }

  return attachments.find(isAttachment) ?? null;
}

export function getBlogPreviewImage(record: BlogRecord): BlogPreviewImage | null {
  if (!shouldShowBlogImage(record)) {
    return null;
  }

  const attachment = getFeaturedImageAttachment(record);
  const fallbackUrl = asText(record.fields["Featured Image URL"]);
  const url = attachment?.url || fallbackUrl;

  if (!url) {
    return null;
  }

  return {
    url,
    alt: asText(record.fields["Alt Text"]) || asText(record.fields["Blog Title"]) || "Blog featured image",
    fileName: asText(record.fields["Featured Image File Name"]) || attachment?.filename || undefined,
    source: attachment?.url ? "attachment" : "url"
  };
}

export function getShopifyArticleImage(record: BlogRecord): ShopifyArticleImage | null {
  const url = asText(record.fields["Featured Image URL"]);

  if (!url) {
    return null;
  }

  return {
    url,
    altText: asText(record.fields["Alt Text"]) || asText(record.fields["Blog Title"]) || undefined
  };
}
