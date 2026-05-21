"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GA4PageRow } from "@/lib/airtable/types";
import type { DateRange } from "@/lib/date-range/types";
import { COPY } from "@/lib/copy";
import { CHART_COLORS, chartAxisProps } from "@/components/seo-analytics/chartTheme";
import { SectionHeaderRow } from "@/components/ui/SectionHeaderRow";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { ga4PageColumns, seoFilename } from "@/lib/csv/columns";
import { formatNumber } from "@/lib/utils/format";

function truncatePath(path: string, max = 36): string {
  if (path.length <= max) return path;
  return `${path.slice(0, max)}…`;
}

export function TopPagesChart({ pages, dateRange }: { pages: GA4PageRow[]; dateRange: DateRange }) {
  const copy = COPY.seoAnalytics.pages.topPages;
  const exportRows = [...pages].sort((a, b) => b.sessions - a.sessions);
  const data = exportRows
    .slice(0, 10)
    .map((page) => ({
      path: truncatePath(page.pagePath || "/"),
      fullPath: page.pagePath || "/",
      sessions: page.sessions
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionHeaderRow
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <CSVExportButton
            data={exportRows}
            columns={ga4PageColumns}
            filename={seoFilename("top-pages", dateRange)}
            resourceType="ga4-top-pages"
          />
        }
      />
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" {...chartAxisProps} />
            <YAxis type="category" dataKey="path" width={140} {...chartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.fullPath}</p>
                    <p className="text-textSecondary">Sessions: {formatNumber(row.sessions)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="sessions" fill={CHART_COLORS.brand} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
