import type { CairrotDashboard, ProjectPrompt } from "@/lib/cairrot/project-dashboard";
import type { PromptResult } from "@/lib/cairrot/types";
import { computeAtAGlance } from "@/lib/utils/overview-display";
import { formatDate, formatDateTime, formatNumber, formatPercent } from "@/lib/utils/format";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const LINE_HEIGHT = 14;
const FOOTER_SPACE = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Palette (RGB 0-1), aligned with the dashboard's slate + cyan theme.
const INK = "0.059 0.090 0.165"; // slate-950
const MUTED = "0.392 0.455 0.545"; // slate-500
const BORDER = "0.796 0.835 0.882"; // slate-300
const LIGHT = "0.945 0.961 0.976"; // slate-100
const CYAN = "0.031 0.569 0.698"; // cyan-600
const CYAN_DARK = "0.055 0.455 0.565"; // cyan-700
const WHITE = "1 1 1";
const ON_INK = "0.796 0.835 0.882"; // muted text on the dark header band

interface TextOptions {
  size?: number;
  bold?: boolean;
  gapAfter?: number;
  color?: string;
}

interface DrawTextOptions {
  bold?: boolean;
  color?: string;
}

class PdfReport {
  private pages: string[] = [];
  private content = "";
  private y = PAGE_HEIGHT - MARGIN;
  private pageNumber = 0;

  constructor() {
    this.startPage();
  }

  /** Full-width branded header band for the top of the report. */
  coverHeader(eyebrow: string, title: string, subtitle?: string) {
    const bandHeight = 96;
    const top = PAGE_HEIGHT;
    this.fillRect(0, top - bandHeight, PAGE_WIDTH, bandHeight, INK);
    this.fillRect(0, top - 4, PAGE_WIDTH, 4, CYAN);
    this.drawText(eyebrow.toUpperCase(), MARGIN, top - 40, 8, { bold: true, color: CYAN });
    this.drawText(title, MARGIN, top - 66, 23, { bold: true, color: WHITE });
    if (subtitle) {
      this.drawText(truncate(subtitle, CONTENT_WIDTH, 10), MARGIN, top - 84, 10, { color: ON_INK });
    }
    this.y = top - bandHeight - 24;
  }

  /** Two-column key/value summary card. */
  metaGrid(items: Array<{ label: string; value: string }>) {
    const cols = 2;
    const rows = Math.ceil(items.length / cols);
    const pad = 14;
    const rowHeight = 26;
    const boxHeight = rows * rowHeight + pad;
    this.ensureSpace(boxHeight + 10);

    const top = this.y;
    const boxY = top - boxHeight;
    this.fillRect(MARGIN, boxY, CONTENT_WIDTH, boxHeight, LIGHT);
    this.strokeRect(MARGIN, boxY, CONTENT_WIDTH, boxHeight, BORDER);

    const colWidth = (CONTENT_WIDTH - pad * 2) / cols;
    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = MARGIN + pad + col * colWidth;
      const cellTop = top - pad - row * rowHeight;
      this.drawText(item.label.toUpperCase(), x, cellTop - 8, 6.5, { bold: true, color: MUTED });
      this.drawText(truncate(item.value, colWidth - 6, 9.5), x, cellTop - 20, 9.5, { bold: true, color: INK });
    });

    this.y = boxY - 18;
  }

  sectionHeading(text: string) {
    this.ensureSpace(34);
    this.y -= 8;
    this.fillRect(MARGIN, this.y - 11, 3.5, 15, CYAN);
    this.drawText(text, MARGIN + 11, this.y - 9, 13, { bold: true, color: INK });
    this.y -= 21;
    this.hline(MARGIN, MARGIN + CONTENT_WIDTH, this.y, BORDER, 0.6);
    this.y -= 14;
  }

  paragraph(text: string, options: TextOptions = {}) {
    const size = options.size ?? 10;
    const lines = wrapText(text, size, CONTENT_WIDTH);
    for (const line of lines) {
      this.text(line, { ...options, gapAfter: 1 });
    }
    this.y -= options.gapAfter ?? 6;
  }

  metricGrid(metrics: Array<{ label: string; value: string }>) {
    const perRow = 4;
    const gap = 8;
    const colWidth = (CONTENT_WIDTH - gap * (perRow - 1)) / perRow;
    const cardHeight = 52;

    for (let i = 0; i < metrics.length; i += perRow) {
      this.ensureSpace(cardHeight + gap);
      const row = metrics.slice(i, i + perRow);
      const top = this.y;
      row.forEach((metric, col) => {
        const x = MARGIN + col * (colWidth + gap);
        this.fillRect(x, top - cardHeight, colWidth, cardHeight, LIGHT);
        this.strokeRect(x, top - cardHeight, colWidth, cardHeight, BORDER);
        this.fillRect(x, top - 3, colWidth, 3, CYAN);
        this.drawText(metric.label.toUpperCase(), x + 9, top - 20, 6.5, { bold: true, color: MUTED });
        this.drawText(truncate(metric.value, colWidth - 14, 17), x + 9, top - 41, 17, { bold: true, color: INK });
      });
      this.y -= cardHeight + gap;
    }
    this.y -= 4;
  }

  table(headers: string[], rows: string[][], widths: number[]) {
    const totalWidth = widths.reduce((sum, w) => sum + w, 0);
    this.ensureSpace(40);
    this.drawTableRow(headers, widths, totalWidth, true, 0);
    rows.forEach((row, index) => this.drawTableRow(row, widths, totalWidth, false, index));
    this.hline(MARGIN, MARGIN + totalWidth, this.y, BORDER, 0.6);
    this.y -= 12;
  }

  list(items: string[]) {
    for (const item of items) {
      const lines = wrapText(item, 10, CONTENT_WIDTH - 16);
      const height = Math.max(16, lines.length * 12 + 4);
      this.ensureSpace(height);
      this.fillRect(MARGIN + 1, this.y - 7, 3, 3, CYAN);
      lines.forEach((line, i) => this.drawText(line, MARGIN + 13, this.y - 8 - i * 12, 10, { color: INK }));
      this.y -= height;
    }
  }

  chips(items: string[]) {
    const height = 19;
    const gap = 6;
    let x = MARGIN;
    this.ensureSpace(height + 6);
    for (const item of items) {
      const label = sanitizeText(item);
      const width = Math.max(30, label.length * 5.2 + 16);
      if (x + width > MARGIN + CONTENT_WIDTH) {
        x = MARGIN;
        this.y -= height + gap;
        this.ensureSpace(height + 6);
      }
      this.fillRect(x, this.y - height, width, height, LIGHT);
      this.strokeRect(x, this.y - height, width, height, BORDER);
      this.drawText(label, x + 8, this.y - height + 6, 8.5, { bold: true, color: CYAN_DARK });
      x += width + gap;
    }
    this.y -= height + 8;
  }

  toBuffer(): Buffer {
    this.finishPage();

    const objects: string[] = [];
    const pageCount = this.pages.length;
    // Objects 1-4 are fixed: Catalog, Pages, regular font, bold font.
    // Page + content stream objects begin at object 5.
    const firstPageObject = 5;
    const pageRefs: string[] = [];

    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push(`<< /Type /Pages /Kids [${Array.from({ length: pageCount }, (_, i) => `${firstPageObject + i * 2} 0 R`).join(" ")}] /Count ${pageCount} >>`);
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

    this.pages.forEach((pageContent, index) => {
      const pageObject = firstPageObject + index * 2;
      const contentObject = pageObject + 1;
      pageRefs.push(`${pageObject} 0 R`);
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`);
      objects.push(`<< /Length ${Buffer.byteLength(pageContent, "utf8")} >>\nstream\n${pageContent}endstream`);
    });

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, "utf8"));
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, "utf8");
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (let i = 1; i < offsets.length; i += 1) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, "utf8");
  }

  private drawTableRow(cells: string[], widths: number[], totalWidth: number, header: boolean, index: number) {
    const size = header ? 7.5 : 8;
    const wrapped = cells.map((cell, i) => wrapText(cell, size, widths[i] - 10));
    const lineCount = Math.max(...wrapped.map((lines) => lines.length));
    const rowHeight = Math.max(header ? 22 : 24, lineCount * 10 + (header ? 10 : 12));
    this.ensureSpace(rowHeight);

    const top = this.y;
    if (header) {
      this.fillRect(MARGIN, top - rowHeight, totalWidth, rowHeight, INK);
    } else if (index % 2 === 1) {
      this.fillRect(MARGIN, top - rowHeight, totalWidth, rowHeight, LIGHT);
    }

    const color = header ? WHITE : INK;
    let x = MARGIN;
    cells.forEach((_, i) => {
      wrapped[i].slice(0, 6).forEach((line, lineIndex) => {
        this.drawText(line, x + 6, top - 14 - lineIndex * 10, size, { bold: header, color });
      });
      x += widths[i];
    });

    if (!header) {
      this.hline(MARGIN, MARGIN + totalWidth, top - rowHeight, BORDER, 0.4);
    }
    this.y -= rowHeight;
  }

  private text(text: string, options: TextOptions = {}) {
    const size = options.size ?? 10;
    this.ensureSpace(size + LINE_HEIGHT);
    this.drawText(text, MARGIN, this.y, size, { bold: options.bold, color: options.color });
    this.y -= LINE_HEIGHT + (options.gapAfter ?? 0);
  }

  private drawText(text: string, x: number, y: number, size: number, options: DrawTextOptions = {}) {
    const font = options.bold ? "F2" : "F1";
    const color = options.color ?? INK;
    this.content += `BT ${color} rg /${font} ${num(size)} Tf ${num(x)} ${num(y)} Td (${escapePdfText(text)}) Tj ET\n`;
  }

  private fillRect(x: number, y: number, width: number, height: number, color: string) {
    this.content += `${color} rg ${num(x)} ${num(y)} ${num(width)} ${num(height)} re f\n`;
  }

  private strokeRect(x: number, y: number, width: number, height: number, color: string, lineWidth = 0.6) {
    this.content += `${num(lineWidth)} w ${color} RG ${num(x)} ${num(y)} ${num(width)} ${num(height)} re S\n`;
  }

  private hline(x1: number, x2: number, y: number, color: string, lineWidth = 0.6) {
    this.content += `${num(lineWidth)} w ${color} RG ${num(x1)} ${num(y)} m ${num(x2)} ${num(y)} l S\n`;
  }

  private drawFooter() {
    const y = 30;
    this.content += `0.5 w ${BORDER} RG ${MARGIN} ${y + 12} m ${MARGIN + CONTENT_WIDTH} ${y + 12} l S\n`;
    this.drawText("ENERGYbits - AEO Analytics Report", MARGIN, y, 7.5, { color: MUTED });
    this.drawText(`Page ${this.pageNumber}`, PAGE_WIDTH - MARGIN - 34, y, 7.5, { color: MUTED });
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN + FOOTER_SPACE) {
      this.finishPage();
      this.startPage();
    }
  }

  private startPage() {
    this.content = "";
    this.y = PAGE_HEIGHT - MARGIN;
    this.pageNumber += 1;
  }

  private finishPage() {
    if (this.content.length > 0) {
      this.drawFooter();
      this.pages.push(this.content);
    }
  }
}

function num(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function truncate(text: string, maxWidth: number, size: number): string {
  const clean = sanitizeText(text);
  const maxChars = Math.max(4, Math.floor(maxWidth / (size * 0.52)));
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(1, maxChars - 2))}..`;
}

export function buildAEOAnalyticsPdf(dashboard: CairrotDashboard): Buffer {
  const { project, run, runs, allPrompts, fetchedAt } = dashboard;
  const report = new PdfReport();
  const latestRun = runs.find((item) => item.runId === run.runId);
  const atAGlance = computeAtAGlance(run);
  const zeroPresencePrompts = run.prompts.filter((prompt) => brandMentionPct(prompt) === 0);
  const competitorDominatedPrompts = run.prompts.filter(
    (prompt) => competitorMentionPct(prompt) > brandMentionPct(prompt)
  );
  const brandStrongPrompts = run.prompts.filter((prompt) => brandMentionPct(prompt) >= 30);

  report.coverHeader(
    "AI Search Visibility",
    "AEO Analytics Report",
    project.url || project.host || "ENERGYbits"
  );
  report.metaGrid([
    { label: "Project", value: project.url || project.host || "ENERGYbits" },
    { label: "Analysis date", value: formatDate(run.createdAt) },
    { label: "Run ID", value: run.runId },
    { label: "Providers", value: latestRun?.providers.join(", ") || run.llms.map((llm) => llm.name).join(", ") },
    { label: "Generated", value: formatDateTime(new Date().toISOString()) },
    { label: "Data updated", value: formatDateTime(fetchedAt) }
  ]);

  report.sectionHeading("Executive Summary");
  report.metricGrid([
    { label: "Brand mention rate", value: formatPercent(atAGlance.brandMentionPct) },
    { label: "Tracked questions", value: formatNumber(atAGlance.totalPrompts) },
    { label: "Questions with brand", value: formatNumber(atAGlance.promptsWithBrand) },
    { label: "Zero presence", value: formatNumber(atAGlance.opportunities) },
    { label: "Total citations", value: formatNumber(run.totals.citations) },
    { label: "Unique domains", value: formatNumber(run.totals.uniqueDomains) },
    { label: "Responses", value: formatNumber(run.totals.responses) },
    { label: "Competitor mentions", value: formatNumber(run.totals.competitorMentions) }
  ]);

  report.sectionHeading("Performance by AI Engine");
  report.table(
    ["Engine", "Citations", "Responses", "Brand cite", "Comp cite", "Brand mention", "Comp mention"],
    run.llms.map((llm) => [
      llm.name,
      formatNumber(llm.citationsCount),
      formatNumber(llm.responsesCount),
      formatPercent(llm.citationShares.brandPct),
      formatPercent(llm.citationShares.competitorPct),
      formatPercent(llm.responseShares.brandOnlyPct + llm.responseShares.bothPct),
      formatPercent(llm.responseShares.competitorOnlyPct + llm.responseShares.bothPct)
    ]),
    [100, 70, 70, 70, 70, 85, 85]
  );

  addPromptSection(report, "Zero-Presence Questions", zeroPresencePrompts, allPrompts);
  addPromptSection(report, "Competitor-Dominated Questions", competitorDominatedPrompts, allPrompts);
  addPromptSection(report, "Brand-Strong Questions", brandStrongPrompts, allPrompts);

  report.sectionHeading("Tracked Competitors");
  report.list(
    project.competitors.length > 0
      ? project.competitors.map((competitor) => `${competitor.name}${competitor.domain ? ` - ${competitor.domain}` : ""}`)
      : ["No competitors configured."]
  );

  report.sectionHeading("Tracked Topics");
  if (project.topics.length > 0) {
    report.chips(project.topics);
  } else {
    report.paragraph("No topics configured.", { color: MUTED });
  }

  return report.toBuffer();
}

function addPromptSection(
  report: PdfReport,
  title: string,
  prompts: PromptResult[],
  allPrompts: ProjectPrompt[]
) {
  report.sectionHeading(title);

  if (prompts.length === 0) {
    report.paragraph(`No ${title.toLowerCase()} in this scan.`, { color: MUTED });
    return;
  }

  report.table(
    ["Question", "Topic", "Audience", "Brand", "Comp", "Neither"],
    prompts.map((prompt) => {
      const meta = promptMeta(prompt.promptId, allPrompts);
      return [
        prompt.text,
        meta.topic,
        meta.buyerPersona,
        formatPercent(brandMentionPct(prompt)),
        formatPercent(competitorMentionPct(prompt)),
        formatPercent(prompt.responseShares.neitherPct)
      ];
    }),
    [216, 88, 82, 44, 44, 44]
  );
}

function brandMentionPct(prompt: PromptResult): number {
  return prompt.responseShares.brandOnlyPct + prompt.responseShares.bothPct;
}

function competitorMentionPct(prompt: PromptResult): number {
  return prompt.responseShares.competitorOnlyPct + prompt.responseShares.bothPct;
}

function promptMeta(promptId: string, allPrompts: ProjectPrompt[]) {
  const match = allPrompts.find((prompt) => prompt.id === promptId);
  return {
    topic: match?.topic || "General",
    buyerPersona: match?.buyerPersona || "Unknown"
  };
}

function wrapText(text: string, size: number, maxWidth: number): string[] {
  const words = sanitizeText(text).split(/\s+/).filter(Boolean);
  const maxChars = Math.max(8, Math.floor(maxWidth / (size * 0.52)));
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function escapePdfText(text: string): string {
  return sanitizeText(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function sanitizeText(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
