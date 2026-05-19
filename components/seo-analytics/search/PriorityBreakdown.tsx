"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { buildPriorityBreakdown } from "@/lib/seo-analytics/metrics";
import { CHART_COLORS } from "@/components/seo-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";

const PRIORITY_COLORS: Record<string, string> = {
  Critical: CHART_COLORS.red,
  High: CHART_COLORS.orange,
  Medium: CHART_COLORS.yellow,
  Low: CHART_COLORS.gray,
  Monitor: "#52525B"
};

export function PriorityBreakdown({ keywords }: { keywords: SEOTrackingRow[] }) {
  const copy = COPY.seoAnalytics.search.priorityMix;
  const data = buildPriorityBreakdown(keywords);
  const total = keywords.length;

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} />
      <div className="relative h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="priority"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? CHART_COLORS.gray} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div
                    style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }}
                    className="text-xs"
                  >
                    <p className="font-medium text-white">{row.priority}</p>
                    <p className="text-textSecondary">{row.count} keywords</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-textMuted">Total</p>
          <p className="text-2xl font-bold tabular-nums text-textPrimary">{total.toLocaleString()}</p>
        </div>
      </div>
    </section>
  );
}
