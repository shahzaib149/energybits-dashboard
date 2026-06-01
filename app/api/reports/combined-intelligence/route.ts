import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { buildCombinedIntelligenceReport } from "@/lib/reports/combined-intelligence";
import { parseReportDateRange } from "@/lib/reports/parse-report-params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dateRange = parseReportDateRange(request.nextUrl.searchParams);
    const runId = request.nextUrl.searchParams.get("runId") ?? undefined;

    const report = await buildCombinedIntelligenceReport({ dateRange, runId });

    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (err) {
    console.error("Combined intelligence report failed:", err);
    const message = err instanceof Error ? err.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
