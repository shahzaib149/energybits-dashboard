import { BlogPipelineFields, AirtableRecord, AirtableValue } from "@/lib/types";
import { asText, formatDate } from "@/lib/utils";

export type BlogPreviewBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export interface BlogPreviewSection {
  title: string;
  blocks: BlogPreviewBlock[];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function sanitizeHtml(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z-]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z-]+\s*=\s*'[^']*'/gi, "")
    .replace(/\shref\s*=\s*"javascript:[^"]*"/gi, ' href="#"')
    .replace(/\shref\s*=\s*'javascript:[^']*'/gi, " href='#'");
}

function markdownToHtml(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let orderedList: string[] = [];
  let inQuote = false;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${inlineMarkdown(escapeHtml(paragraph.join(" ").trim())).replace(/\n/g, "<br />")}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length > 0) {
      html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(escapeHtml(item))}</li>`).join("")}</ul>`);
      list = [];
    }
    if (orderedList.length > 0) {
      html.push(`<ol>${orderedList.map((item) => `<li>${inlineMarkdown(escapeHtml(item))}</li>`).join("")}</ol>`);
      orderedList = [];
    }
  };

  const flushQuote = () => {
    if (quote.length > 0) {
      html.push(`<blockquote>${inlineMarkdown(escapeHtml(quote.join(" ")))}</blockquote>`);
      quote = [];
      inQuote = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = Math.min(line.match(/^#+/)?.[0].length ?? 1, 3);
      const text = line.replace(/^#{1,3}\s+/, "");
      html.push(`<h${level}>${inlineMarkdown(escapeHtml(text))}</h${level}>`);
      continue;
    }

    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      html.push("<hr />");
      continue;
    }

    if (/^>\s+/.test(line)) {
      flushParagraph();
      flushList();
      inQuote = true;
      quote.push(line.replace(/^>\s+/, ""));
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      flushParagraph();
      flushQuote();
      list.push(line.replace(/^[-*•]\s+/, ""));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushQuote();
      orderedList.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }

    if (inQuote) {
      quote.push(line);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return html.join("");
}

export function getBlogPreviewSource(record: AirtableRecord<BlogPipelineFields>) {
  return asText(record.fields["Human Edited Draft"] || record.fields["AI Draft"]).trim();
}

export function renderBlogContent(source: string) {
  if (!source.trim()) {
    return "";
  }

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(source);

  if (looksLikeHtml) {
    return sanitizeHtml(source);
  }

  return markdownToHtml(source);
}

export function parseBlogPreviewBlocks(text: string): BlogPreviewBlock[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());

  const blocks: BlogPreviewBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = /^([A-Z][A-Za-z0-9\s:&/-]{2,}|(?:\d+\.)\s+.+|(?:H1|H2|FAQ|CTA)\s*[:\-].+)$/u.test(line);
    const bulletMatch = /^[-*•]\s+/.test(line);
    const quoteMatch = /^>\s+/.test(line);

    if (headingMatch && line.length < 120 && !line.endsWith(".")) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        text: line.replace(/^(?:\d+\.)\s+/, "").replace(/^(H1|H2|FAQ|CTA)\s*[:\-]\s*/i, "")
      });
      continue;
    }

    if (bulletMatch) {
      flushParagraph();
      listItems.push(line.replace(/^[-*•]\s+/, ""));
      continue;
    }

    if (quoteMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: line.replace(/^>\s+/, "") });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function sectionFromText(title: string, text: string): BlogPreviewSection | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const blocks = parseBlogPreviewBlocks(trimmed);
  if (blocks.length === 0) {
    return null;
  }

  return { title, blocks };
}

export function buildBlogPreviewSections(record: AirtableRecord<BlogPipelineFields>) {
  const sections: BlogPreviewSection[] = [];
  const body = getBlogPreviewSource(record);

  const outlineSections: Array<[string, AirtableValue]> = [
    ["H1", record.fields.H1],
    ["Meta Title", record.fields["Meta Title"]],
    ["Meta Description", record.fields["Meta Description"]],
    ["Body", body],
    ["H2 Structure", record.fields["H2 Structure"]],
    ["FAQ Section", record.fields["FAQ Section"]],
    ["CTA", record.fields.CTA]
  ];

  for (const [title, text] of outlineSections) {
    const section = sectionFromText(title, asText(text));
    if (section) {
      sections.push(section);
    }
  }

  return sections;
}

export function formatBlogPreviewDate(value?: AirtableValue) {
  return formatDate(asText(value));
}
