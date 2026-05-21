const DEFAULT_TIMEOUT_MS = 15_000;

export interface BlogPublishWebhookPayload {
  recordId: string;
  blogTitle: string;
  triggeredBy: string;
  triggeredAt: string;
}

export function getBlogPublishWebhookUrl(): string | null {
  const url = process.env.BLOG_PUBLISH_WEBHOOK_URL?.trim();
  return url || null;
}

export async function triggerBlogPublishWebhook(
  payload: BlogPublishWebhookPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const webhookUrl = getBlogPublishWebhookUrl();
  if (!webhookUrl) {
    return { ok: false, message: "Publish webhook is not configured" };
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
