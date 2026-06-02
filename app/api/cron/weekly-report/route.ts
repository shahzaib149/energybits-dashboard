import { NextRequest, NextResponse } from "next/server";
import {
  buildWeeklyReportPayload,
  isWeeklyReportWebhookConfigured,
  postWeeklyReportToMake
} from "@/lib/reports/weekly-report-webhook";
import { logAuditEvent } from "@/lib/audit/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWeeklyReportWebhookConfigured()) {
    return NextResponse.json({ skipped: true, reason: "Weekly report webhook not configured" });
  }

  try {
    const payload = await buildWeeklyReportPayload();
    await postWeeklyReportToMake(payload);

    await logAuditEvent({
      action: "weekly_report_triggered",
      resourceType: "weekly-report",
      metadata: {
        trigger: "cron",
        schedule: "weekly_monday_9_30am_utc",
        weekOf: payload.weekOf,
        gapTotal: payload.gaps.total,
        blogCount: payload.recentBlogs.length
      }
    });

    return NextResponse.json({ success: true, weekOf: payload.weekOf });
  } catch (err) {
    console.error("[cron/weekly-report]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
