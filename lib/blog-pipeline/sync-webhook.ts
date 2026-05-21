import type { BlogSyncWebhookPayload } from "@/lib/blog-pipeline/sync-payload";

const DEFAULT_TIMEOUT_MS = 15_000;

export function getBlogSyncWebhookUrl(): string | null {
  const syncUrl = process.env.BLOG_SYNC_WEBHOOK_URL?.trim();
  if (syncUrl) return syncUrl;
  const publishUrl = process.env.BLOG_PUBLISH_WEBHOOK_URL?.trim();
  return publishUrl || null;
}

export async function triggerBlogSyncWebhook(
  payload: BlogSyncWebhookPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const webhookUrl = getBlogSyncWebhookUrl();
  if (!webhookUrl) {
    return { ok: false, message: "Blog sync webhook is not configured" };
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
