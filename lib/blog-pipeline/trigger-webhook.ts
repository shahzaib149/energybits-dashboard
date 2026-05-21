import type { BlogSubmitWebhookPayload } from "@/lib/blog-pipeline/submit-types";

const DEFAULT_TIMEOUT_MS = 20_000;

export function getBlogTriggerWebhookUrl(): string | null {
  const trigger = process.env.BLOG_TRIGGER_WEBHOOK_URL?.trim();
  if (trigger) return trigger;
  return process.env.BLOG_PUBLISH_WEBHOOK_URL?.trim() || null;
}

export async function triggerBlogCreationWebhook(
  payload: BlogSubmitWebhookPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const webhookUrl = getBlogTriggerWebhookUrl();
  if (!webhookUrl) {
    return { ok: false, message: "Blog trigger webhook is not configured (BLOG_TRIGGER_WEBHOOK_URL)" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { ok: false, message: text || `Webhook returned ${response.status}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook request failed";
    return { ok: false, message };
  } finally {
    clearTimeout(timeout);
  }
}
