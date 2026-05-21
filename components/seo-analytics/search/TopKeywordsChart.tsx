"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import type { DateRange } from "@/lib/date-range/types";
import { dedupeKeywordsByQuery } from "@/lib/seo-analytics/metrics";
import { CHART_COLORS, ChartTooltip, chartAxisProps } from "@/components/seo-analytics/chartTheme";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { seoFilename, seoKeywordColumns } from "@/lib/csv/columns";
import { formatNumber, formatPercent, formatPosition } from "@/lib/utils/format";

export function TopKeywordsChart({
  keywords,
  dateRange
}: {
  keywords: SEOTrackingRow[];
  dateRange: DateRange;
}) {
  const copy = COPY.seoAnalytics.search.topKeywords;
  const exportRows = dedupeKeywordsByQuery(keywords).sort((a, b) => b.clicks - a.clicks);
  const data = exportRows
    .slice(0, 15)
    .map((row) => ({
      keyword: row.query.length > 42 ? `${row.query.slice(0, 42)}…` : row.query,
      fullKeyword: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.averagePosition,
      ctrPct: row.ctrPct,
      brandType: row.brandType
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={exportRows}
            columns={seoKeywordColumns}
            filename={seoFilename("top-keywords", dateRange)}
            resourceType="seo-keywords"
          />
        }
      />
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" {...chartAxisProps} />
            <YAxis type="category" dataKey="keyword" width={140} {...chartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.fullKeyword}</p>
                    <p className="text-textSecondary">Clicks: {formatNumber(row.clicks)}</p>
                    <p className="text-textSecondary">Impressions: {formatNumber(row.impressions)}</p>
                    <p className="text-textSecondary">CTR: {formatPercent(row.ctrPct)}</p>
                    <p className="text-textSecondary">Position: {formatPosition(row.position)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.fullKeyword}
                  fill={entry.brandType === "Branded" ? CHART_COLORS.brand : CHART_COLORS.blue}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
