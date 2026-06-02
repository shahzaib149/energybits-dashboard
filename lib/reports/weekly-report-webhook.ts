import { Agent, fetch as undiciFetch } from "undici";
import { buildCombinedIntelligenceReport, dateRangeFromDays } from "@/lib/reports/combined-intelligence";
import { getAirtableClient } from "@/lib/airtable/client";

const REQUEST_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2_000;

const webhookDispatcher = new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 60_000,
  bodyTimeout: 120_000
});

export interface WeeklyReportBlog {
  title: string;
  targetKeyword: string;
  status: string;
  createdAt: string;
}

export interface WeeklyReportPayload {
  reportType: "weekly";
  generatedAt: string;
  weekOf: string;
  language: string;
  seo: {
    totalKeywords: number;
    avgPosition: number;
    totalImpressions: number;
    totalClicks: number;
    avgCTR: number;
  } | null;
  aeo: {
    brandMentionRate: number;
    totalCitations: number;
    strongestPlatform: string;
    weakestPlatform: string;
  } | null;
  geo: {
    overallScore: number;
    lastUpdated: string;
  } | null;
  gaps: {
    total: number;
    critical: number;
    high: number;
    medium: number;
  };
  recentBlogs: WeeklyReportBlog[];
}

export function getWeeklyReportWebhookUrl(): string | null {
  return process.env.MAKE_WEEKLY_REPORT_WEBHOOK_URL?.trim() || null;
}

export function isWeeklyReportWebhookConfigured(): boolean {
  return Boolean(getWeeklyReportWebhookUrl());
}

/** Returns the Monday date string (YYYY-MM-DD) for the current week. */
function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day; // back to Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + offset);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

export async function buildWeeklyReportPayload(): Promise<WeeklyReportPayload> {
  const dateRange = dateRangeFromDays(28);

  // Fetch intelligence report and recent blogs in parallel
  const [report, recentBlogsRaw] = await Promise.all([
    buildCombinedIntelligenceReport({ dateRange }).catch(() => null),
    getAirtableClient().getBlogPipeline({ limit: 5 }).catch(() => [])
  ]);

  // Pick the 2 most recently modified blogs
  const recentBlogs: WeeklyReportBlog[] = recentBlogsRaw.slice(0, 2).map((b) => ({
    title: b.blogTitle || b.suggestedBlogTitle || "Untitled",
    targetKeyword: b.targetKeyword || "",
    status: b.blogStatus,
    createdAt: b.createdTime
  }));

  return {
    reportType: "weekly",
    generatedAt: new Date().toISOString(),
    weekOf: getCurrentWeekMonday(),
    language: process.env.MAKE_INTELLIGENCE_LANGUAGE?.trim() || "en",
    seo: report?.seo?.summary
      ? {
          totalKeywords: report.seo.summary.totalKeywords,
          avgPosition: report.seo.summary.avgPosition,
          totalImpressions: report.seo.summary.totalImpressions,
          totalClicks: report.seo.summary.totalClicks,
          avgCTR: report.seo.summary.avgCTR
        }
      : null,
    aeo: report?.aeo?.summary
      ? {
          brandMentionRate: report.aeo.summary.brandMentionRate,
          totalCitations: report.aeo.summary.totalCitations,
          strongestPlatform: report.aeo.summary.strongestPlatform,
          weakestPlatform: report.aeo.summary.weakestPlatform
        }
      : null,
    geo: report?.geo
      ? {
          overallScore: report.geo.overallScore,
          lastUpdated: report.geo.lastUpdated
        }
      : null,
    gaps: {
      total: report?.actionableGaps.totalGaps ?? 0,
      critical: report?.actionableGaps.criticalGaps ?? 0,
      high: report?.actionableGaps.highGaps ?? 0,
      medium: report?.actionableGaps.mediumGaps ?? 0
    },
    recentBlogs
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error.cause as { code?: string } | undefined)?.code ?? "";
  return (
    error.name === "AbortError" ||
    error.message.includes("fetch failed") ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_BODY_TIMEOUT" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ENOTFOUND"
  );
}

export async function postWeeklyReportToMake(payload: WeeklyReportPayload): Promise<void> {
  const url = getWeeklyReportWebhookUrl();
  if (!url) throw new Error("Weekly report webhook is not configured");

  const body = JSON.stringify(payload);
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await undiciFetch(url, {
        method: "POST",
        dispatcher: webhookDispatcher,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Weekly report webhook returned ${response.status}`);
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES && isRetriable(error)) {
        await sleep(RETRY_BASE_DELAY_MS * attempt);
        continue;
      }
      throw error instanceof Error ? error : new Error("Failed to reach weekly report webhook");
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to reach weekly report webhook");
}
