import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { COPY } from "@/lib/copy";
import { buildCombinedIntelligenceReport } from "@/lib/reports/combined-intelligence";
import {
  isMakeIntelligenceWebhookConfigured,
  postIntelligenceReportToMake
} from "@/lib/reports/make-webhook";
import { parseReportDateRange } from "@/lib/reports/parse-report-params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Report build + Make webhook POST can exceed 30s on slow networks. */
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMakeIntelligenceWebhookConfigured()) {
    return NextResponse.json({ error: "Webhook URL not configured" }, { status: 500 });
  }

  try {
    const dateRange = parseReportDateRange(request.nextUrl.searchParams);
    const report = await buildCombinedIntelligenceReport({ dateRange });

    await postIntelligenceReportToMake(report);

    const ctx = getRequestContext(request);
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "intelligence_recommendations_triggered",
      resourceType: "combined-intelligence-report",
      metadata: {
        days: report.dateRange.days,
        gapCount: report.actionableGaps.totalGaps,
        criticalGaps: report.actionableGaps.criticalGaps,
        timestamp: report.generatedAt
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent
    });

    return NextResponse.json({
      success: true,
      message: COPY.hub.intelligenceGaps.triggerAI.success,
      gapCount: report.actionableGaps.totalGaps
    });
  } catch (err) {
    console.error("Trigger recommendations error:", err);
    const fallback = COPY.hub.intelligenceGaps.triggerAI.error;
    const message =
      err instanceof Error && err.message.includes("Make.com")
        ? err.message
        : err instanceof Error && err.message.includes("fetch failed")
          ? COPY.hub.intelligenceGaps.triggerAI.networkError
          : err instanceof Error
            ? err.message
            : fallback;
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
