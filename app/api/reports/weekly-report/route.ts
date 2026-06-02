import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import {
  buildWeeklyReportPayload,
  isWeeklyReportWebhookConfigured,
  postWeeklyReportToMake
} from "@/lib/reports/weekly-report-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWeeklyReportWebhookConfigured()) {
    return NextResponse.json({ error: "Weekly report webhook is not configured" }, { status: 500 });
  }

  try {
    const payload = await buildWeeklyReportPayload();
    await postWeeklyReportToMake(payload);

    const ctx = getRequestContext(request);
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "weekly_report_triggered",
      resourceType: "weekly-report",
      metadata: {
        trigger: "manual",
        weekOf: payload.weekOf,
        gapTotal: payload.gaps.total,
        blogCount: payload.recentBlogs.length
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[weekly-report] manual trigger failed:", err);
    const message = err instanceof Error ? err.message : "Failed to send weekly report";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
