import { Agent, fetch as undiciFetch } from "undici";
import type { CombinedIntelligenceReport } from "@/lib/reports/types";

/** Total request budget (report build + webhook can exceed 12s locally). */
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2_000;

/**
 * Node's default fetch uses a 10s connect timeout — too short for Make.com
 * when uploading ~15KB JSON on slower networks.
 */
const makeWebhookDispatcher = new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 60_000,
  bodyTimeout: 120_000
});

export function getMakeIntelligenceWebhookUrl(): string | null {
  const url = process.env.MAKE_INTELLIGENCE_WEBHOOK_URL?.trim();
  return url || null;
}

export function isMakeIntelligenceWebhookConfigured(): boolean {
  return Boolean(getMakeIntelligenceWebhookUrl());
}

/** Make.com modules in the intelligence scenario require a top-level `language` field. */
export function getMakeIntelligenceLanguage(): string {
  return process.env.MAKE_INTELLIGENCE_LANGUAGE?.trim() || "en";
}

export type MakeIntelligenceWebhookPayload = CombinedIntelligenceReport & {
  language: string;
};

export function buildMakeIntelligenceWebhookPayload(
  report: CombinedIntelligenceReport
): MakeIntelligenceWebhookPayload {
  return {
    language: getMakeIntelligenceLanguage(),
    ...report
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableWebhookError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = error.cause as { code?: string } | undefined;
  const code = cause?.code ?? "";
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

function toWebhookError(error: unknown): Error {
  if (error instanceof Error && error.name === "AbortError") {
    return new Error(
      "Make.com did not respond in time. The scenario may still have started — check Make execution history."
    );
  }

  const cause = error instanceof Error ? (error.cause as { code?: string } | undefined) : undefined;
  const code = cause?.code ?? "";

  if (
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    (error instanceof Error && error.message.includes("Connect Timeout"))
  ) {
    return new Error(
      "Could not connect to Make.com (timed out). Check internet, firewall, or VPN, then try again."
    );
  }

  if (error instanceof Error) return error;
  return new Error("Failed to reach Make.com webhook");
}

export async function postIntelligenceReportToMake(
  report: CombinedIntelligenceReport
): Promise<void> {
  const url = getMakeIntelligenceWebhookUrl();
  if (!url) {
    throw new Error("Recommendation automation is not configured");
  }

  const body = JSON.stringify(buildMakeIntelligenceWebhookPayload(report));
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await undiciFetch(url, {
        method: "POST",
        dispatcher: makeWebhookDispatcher,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Recommendation service returned ${response.status}`);
      }

      return;
    } catch (error) {
      lastError = error;
      const retriable = isRetriableWebhookError(error);
      console.warn(
        `[make-webhook] Attempt ${attempt}/${MAX_RETRIES} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt < MAX_RETRIES && retriable) {
        await sleep(RETRY_BASE_DELAY_MS * attempt);
        continue;
      }

      throw toWebhookError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw toWebhookError(lastError);
}
