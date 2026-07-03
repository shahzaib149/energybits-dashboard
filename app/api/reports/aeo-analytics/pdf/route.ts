import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getCairrotClient } from "@/lib/cairrot/client";
import { buildAEOAnalyticsPdf } from "@/lib/reports/aeo-pdf";
import { isCairrotConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCairrotConfigured()) {
    return NextResponse.json({ error: "AEO Analytics not configured" }, { status: 503 });
  }

  try {
    const runId = request.nextUrl.searchParams.get("runId") ?? undefined;
    const dashboard = await getCairrotClient().getFullDashboard(runId);
    const pdf = buildAEOAnalyticsPdf(dashboard);
    const filename = `energybits-aeo-analytics-${dashboard.run.runId}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (err) {
    console.error("AEO Analytics PDF generation failed:", err);
    const message = err instanceof Error ? err.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
