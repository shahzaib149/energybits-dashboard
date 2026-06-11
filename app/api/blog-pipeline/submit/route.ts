import { NextResponse } from "next/server";
import { Agent, fetch as undiciFetch } from "undici";
import { getServerUser } from "@/lib/auth/getServerUser";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { getBlogTriggerWebhookUrl } from "@/lib/blog-pipeline/trigger-webhook";
import { buildCombinedIntelligenceReport, dateRangeFromDays } from "@/lib/reports/combined-intelligence";
import { getMakeIntelligenceLanguage } from "@/lib/reports/make-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const webhookDispatcher = new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 60_000,
  bodyTimeout: 120_000
});

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { blogTitle?: string };
  try {
    body = (await req.json()) as { blogTitle?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const blogTitle = body.blogTitle?.trim();
  if (!blogTitle || blogTitle.length < 4) {
    return NextResponse.json({ error: "Blog title is required" }, { status: 400 });
  }

  const webhookUrl = getBlogTriggerWebhookUrl();
  if (!webhookUrl) {
    return NextResponse.json({ error: "Blog trigger webhook is not configured" }, { status: 503 });
  }

  // Build the same full intelligence report the AI trigger sends
  const dateRange = dateRangeFromDays(28);
  const report = await buildCombinedIntelligenceReport({ dateRange });

  const payload = {
    event: "blog_creation_triggered",
    blogTitle,
    triggeredBy: user.email,
    triggeredAt: new Date().toISOString(),
    language: getMakeIntelligenceLanguage(),
    ...report
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const res = await undiciFetch(webhookUrl, {
      method: "POST",
      dispatcher: webhookDispatcher,
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: text || `Webhook returned ${res.status}` }, { status: 502 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach webhook";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  const { ipAddress, userAgent } = getRequestContext(req);
  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    action: "blog.topic_submitted",
    resourceType: "blog_topic",
    metadata: {
      blogTitle,
      gapCount: report.actionableGaps.totalGaps,
      criticalGaps: report.actionableGaps.criticalGaps
    },
    ipAddress,
    userAgent
  });

  return NextResponse.json({ ok: true, blogTitle });
}
