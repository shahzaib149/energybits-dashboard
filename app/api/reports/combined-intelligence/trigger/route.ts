import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { postIntelligenceReportToMake, isMakeIntelligenceWebhookConfigured } from "@/lib/reports/make-webhook";
import type { CombinedIntelligenceReport } from "@/lib/reports/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isCombinedIntelligenceReport(value: unknown): value is CombinedIntelligenceReport {
  if (!value || typeof value !== "object") return false;
  const report = value as CombinedIntelligenceReport;
  return (
    typeof report.generatedAt === "string" &&
    typeof report.source === "string" &&
    report.actionableGaps != null &&
    typeof report.actionableGaps.totalGaps === "number"
  );
}

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMakeIntelligenceWebhookConfigured()) {
    return NextResponse.json(
      { error: "Recommendation automation is not configured" },
      { status: 503 }
    );
  }

  try {
    const body: unknown = await request.json();
    if (!isCombinedIntelligenceReport(body)) {
      return NextResponse.json({ error: "Invalid intelligence report payload" }, { status: 400 });
    }

    await postIntelligenceReportToMake(body);

    const ctx = getRequestContext(request);
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "intelligence_report.triggered",
      resourceType: "combined-intelligence-report",
      metadata: {
        days: body.dateRange?.days ?? null,
        gapCount: body.actionableGaps.totalGaps,
        webhook: "intelligence-automation"
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent
    });

    return NextResponse.json({
      ok: true,
      gapCount: body.actionableGaps.totalGaps,
      generatedAt: body.generatedAt
    });
  } catch (err) {
    console.error("Intelligence report trigger failed:", err);
    const message = err instanceof Error ? err.message : "Webhook trigger failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
