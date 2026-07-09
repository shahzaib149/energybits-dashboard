import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { airtable } from "@/lib/airtable/client";
import { isSEOAnalyticsConfigured } from "@/lib/seo-analytics/env";
import { parseDateRangeWithBounds } from "@/lib/date-range/parse";
import { buildSEOAnalyticsPdf } from "@/lib/reports/seo-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSEOAnalyticsConfigured()) {
    return NextResponse.json({ error: "SEO Analytics not configured" }, { status: 503 });
  }

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const dataBounds = await airtable.getDataBounds();
    const { range: dateRange } = parseDateRangeWithBounds(params, dataBounds);

    const [keywords, pages, sources, critical, lowCTR, page2, channels] = await Promise.all([
      airtable.getSEOKeywords({ limit: 500, dateRange }),
      airtable.getTopPagesBySessions(50, dateRange),
      airtable.getTrafficSources(50, dateRange),
      airtable.getCriticalKeywords(dateRange),
      airtable.getLowCTRKeywords(dateRange),
      airtable.getPage2Opportunities(dateRange),
      airtable.getChannelBreakdown(dateRange)
    ]);

    const pdf = buildSEOAnalyticsPdf(
      { keywords, pages, sources, critical, lowCTR, page2, channels, dataBounds },
      dateRange
    );

    const filename = `energybits-seo-analytics-${dateRange.from}-to-${dateRange.to}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (err) {
    console.error("SEO Analytics PDF generation failed:", err);
    const message = err instanceof Error ? err.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
