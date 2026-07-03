import type { ChannelBreakdownRow, GA4PageRow, GA4SourceRow, SEOTrackingRow } from "@/lib/airtable/types";
import type { DataBounds, DateRange } from "@/lib/date-range/types";
import { formatDateRangeLabel, formatDateShort } from "@/lib/date-range/format";
import {
  averageCTR,
  buildPositionDistribution,
  buildPriorityBreakdown,
  dedupeKeywordsByQuery,
  sumClicks,
  sumImpressions,
  weightedAveragePosition
} from "@/lib/seo-analytics/metrics";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatPosition
} from "@/lib/utils/format";
import { PdfReport, MUTED } from "@/lib/reports/pdf-builder";

export interface SEOReportData {
  keywords: SEOTrackingRow[];
  pages: GA4PageRow[];
  sources: GA4SourceRow[];
  critical: SEOTrackingRow[];
  lowCTR: SEOTrackingRow[];
  page2: SEOTrackingRow[];
  channels: ChannelBreakdownRow[];
  dataBounds: DataBounds | null;
}

const MAX_TABLE_ROWS = 15;

export function buildSEOAnalyticsPdf(data: SEOReportData, dateRange: DateRange): Buffer {
  const { keywords, pages, sources, critical, lowCTR, page2, channels, dataBounds } = data;
  const report = new PdfReport("ENERGYbits - SEO Analytics Report");

  const rangeLabel = `${formatDateShort(dateRange.from)} - ${formatDateShort(dateRange.to)}`;

  report.coverHeader("Search Engine Optimization", "SEO Analytics Report", `Reporting period: ${rangeLabel}`);
  report.metaGrid([
    { label: "Date range", value: `${formatDateRangeLabel(dateRange)} (${rangeLabel})` },
    { label: "Keyword rows", value: formatNumber(keywords.length) },
    { label: "Generated", value: formatDateTime(new Date().toISOString()) },
    {
      label: "Data available",
      value: dataBounds ? `${formatDateShort(dataBounds.minDate)} - ${formatDateShort(dataBounds.maxDate)}` : "Unknown"
    }
  ]);

  // ── Executive summary ────────────────────────────────────────────
  const totalSessions = pages.reduce((sum, page) => sum + page.sessions, 0);
  const sessionWeight = totalSessions || 1;
  const avgEngagement = pages.reduce((sum, page) => sum + page.engagementRatePct * page.sessions, 0) / sessionWeight;
  const avgBounce = pages.reduce((sum, page) => sum + page.bounceRatePct * page.sessions, 0) / sessionWeight;
  const avgDuration = pages.reduce((sum, page) => sum + page.averageSessionDuration * page.sessions, 0) / sessionWeight;

  report.sectionHeading("Executive Summary");
  report.metricGrid([
    { label: "Total clicks", value: formatNumber(sumClicks(keywords)) },
    { label: "Total impressions", value: formatNumber(sumImpressions(keywords)) },
    { label: "Avg CTR", value: formatPercent(averageCTR(keywords)) },
    { label: "Avg position", value: formatPosition(weightedAveragePosition(keywords)) },
    { label: "Total sessions", value: formatNumber(totalSessions) },
    { label: "Avg engagement", value: formatPercent(avgEngagement) },
    { label: "Avg bounce", value: formatPercent(avgBounce) },
    { label: "Avg session", value: formatDuration(avgDuration) }
  ]);

  // ── Ranking distribution & priorities ────────────────────────────
  const distribution = buildPositionDistribution(keywords);
  report.sectionHeading("Ranking Distribution");
  if (distribution.length > 0) {
    report.table(
      ["Position bucket", "Keywords", "Share"],
      distribution.map((row) => [row.bucket, formatNumber(row.count), formatPercent(row.pct)]),
      [260, 128, 128]
    );
  } else {
    report.paragraph("No keyword ranking data in this range.", { color: MUTED });
  }

  const priorities = buildPriorityBreakdown(keywords);
  report.sectionHeading("SEO Priority Breakdown");
  if (priorities.length > 0) {
    report.chips(priorities.map((row) => `${row.priority}: ${row.count}`));
  } else {
    report.paragraph("No prioritized keywords in this range.", { color: MUTED });
  }

  // ── Keyword opportunity tables ───────────────────────────────────
  addKeywordTable(report, "Critical Keywords", critical);
  addKeywordTable(report, "Low CTR Opportunities", lowCTR);
  addKeywordTable(report, "Page 2 Ranking Opportunities", page2);

  // ── Page performance ─────────────────────────────────────────────
  report.sectionHeading("Top Pages by Sessions");
  if (pages.length > 0) {
    report.table(
      ["Page", "Sessions", "Engagement", "Bounce", "Avg time"],
      pages.slice(0, MAX_TABLE_ROWS).map((page) => [
        page.pagePath,
        formatNumber(page.sessions),
        formatPercent(page.engagementRatePct),
        formatPercent(page.bounceRatePct),
        formatDuration(page.averageSessionDuration)
      ]),
      [200, 76, 84, 76, 80]
    );
  } else {
    report.paragraph("No page analytics in this range.", { color: MUTED });
  }

  // ── Traffic channels ─────────────────────────────────────────────
  report.sectionHeading("Traffic Channels");
  if (channels.length > 0) {
    report.table(
      ["Channel", "Sessions", "Share"],
      channels.map((row) => [row.channel, formatNumber(row.sessions), formatPercent(row.pct)]),
      [260, 128, 128]
    );
  } else {
    report.paragraph("No channel data in this range.", { color: MUTED });
  }

  // ── Traffic sources ──────────────────────────────────────────────
  report.sectionHeading("Top Traffic Sources");
  if (sources.length > 0) {
    report.table(
      ["Source / Medium", "Sessions", "Engagement", "Bounce"],
      sources.slice(0, MAX_TABLE_ROWS).map((source) => [
        `${source.source} / ${source.medium}`,
        formatNumber(source.sessions),
        formatPercent(source.engagementRatePct),
        formatPercent(source.bounceRatePct)
      ]),
      [220, 96, 100, 100]
    );
  } else {
    report.paragraph("No traffic source data in this range.", { color: MUTED });
  }

  return report.toBuffer();
}

function addKeywordTable(report: PdfReport, title: string, rows: SEOTrackingRow[]) {
  report.sectionHeading(title);
  if (rows.length === 0) {
    report.paragraph(`No ${title.toLowerCase()} in this range.`, { color: MUTED });
    return;
  }

  const deduped = dedupeKeywordsByQuery(rows)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, MAX_TABLE_ROWS);

  report.table(
    ["Query", "Clicks", "Impr.", "CTR", "Position"],
    deduped.map((row) => [
      row.query,
      formatNumber(row.clicks),
      formatNumber(row.impressions),
      formatPercent(row.ctrPct),
      formatPosition(row.averagePosition)
    ]),
    [216, 72, 76, 68, 84]
  );
}
