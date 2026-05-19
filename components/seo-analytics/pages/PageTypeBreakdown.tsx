"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { GA4PageRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { aggregatePageTypeSessions } from "@/lib/seo-analytics/metrics";
import { CHART_COLORS } from "@/components/seo-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatNumber } from "@/lib/utils/format";

const TYPE_COLORS = [CHART_COLORS.brand, CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.cyan, CHART_COLORS.gray];

export function PageTypeBreakdown({ pages }: { pages: GA4PageRow[] }) {
  const copy = COPY.seoAnalytics.pages.pageTypes;
  const data = aggregatePageTypeSessions(pages);
  const totalSessions = data.reduce((sum, row) => sum + row.sessions, 0);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="relative h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="sessions" nameKey="type" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.type} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.type}</p>
                    <p className="text-textSecondary">{formatNumber(row.sessions)} sessions</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-textMuted">Sessions</p>
          <p className="text-xl font-bold tabular-nums text-textPrimary">{formatNumber(totalSessions)}</p>
        </div>
      </div>
    </section>
  );
}
