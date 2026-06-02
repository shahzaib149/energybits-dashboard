import { NextRequest, NextResponse } from "next/server";
import { buildCombinedIntelligenceReport, dateRangeFromDays } from "@/lib/reports/combined-intelligence";
import {
  isMakeIntelligenceWebhookConfigured,
  postIntelligenceReportToMake
} from "@/lib/reports/make-webhook";
import { logAuditEvent } from "@/lib/audit/logger";
import { getCronSettings, updateCronSettings } from "@/lib/cron/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  // Vercel sets CRON_SECRET and passes it as "Authorization: Bearer <secret>"
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMakeIntelligenceWebhookConfigured()) {
    return NextResponse.json({ skipped: true, reason: "Webhook not configured" });
  }

  const settings = await getCronSettings();
  if (!settings.enabled) {
    return NextResponse.json({ skipped: true, reason: "Auto-trigger is disabled" });
  }

  await updateCronSettings({ last_run_status: "running" });

  try {
    const dateRange = dateRangeFromDays(28);
    const report = await buildCombinedIntelligenceReport({ dateRange });

    await postIntelligenceReportToMake(report);

    await updateCronSettings({
      last_run_at: new Date().toISOString(),
      last_run_status: "success",
      last_run_gap_count: report.actionableGaps.totalGaps,
      last_run_error: null
    });

    await logAuditEvent({
      action: "intelligence_auto_triggered",
      resourceType: "combined-intelligence-report",
      metadata: {
        trigger: "cron",
        schedule: "weekly_monday_9am_utc",
        days: 28,
        gapCount: report.actionableGaps.totalGaps,
        criticalGaps: report.actionableGaps.criticalGaps
      }
    });

    return NextResponse.json({ success: true, gapCount: report.actionableGaps.totalGaps });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    await updateCronSettings({
      last_run_at: new Date().toISOString(),
      last_run_status: "error",
      last_run_error: message
    });

    await logAuditEvent({
      action: "intelligence_auto_triggered",
      resourceType: "combined-intelligence-report",
      metadata: { trigger: "cron", error: message }
    });

    console.error("[cron/weekly-trigger]", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
