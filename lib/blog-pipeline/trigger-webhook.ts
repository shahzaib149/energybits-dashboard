import type { AEOPrompt, BlogKeyword } from "./submit-types";

const TIMEOUT_MS = 15_000;

export interface BlogCreationWebhookPayload {
  event: "blog_creation_triggered";
  recordId: string;
  blogTitle: string;
  triggeredBy: string;
  triggeredAt: string;
  keyword: BlogKeyword;
  aeoPrompt: AEOPrompt;
  promptText: string;
  fields: Record<string, string>;
  airtableFields: Record<string, unknown>;
}

export function getBlogTriggerWebhookUrl(): string | null {
  return process.env.BLOG_TRIGGER_WEBHOOK_URL?.trim() || null;
}

export async function triggerBlogCreationWebhook(
  payload: BlogCreationWebhookPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const url = getBlogTriggerWebhookUrl();
  if (!url) {
    return { ok: false, message: "BLOG_TRIGGER_WEBHOOK_URL is not configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store"
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, message: text || `Webhook returned ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Webhook request failed" };
  } finally {
    clearTimeout(timeout);
  }
}
