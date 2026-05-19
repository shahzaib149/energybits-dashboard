"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SEOTrackingRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { buildPositionDistribution } from "@/lib/seo-analytics/metrics";
import { CHART_COLORS, chartAxisProps } from "@/components/seo-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatPercent } from "@/lib/utils/format";

const BUCKET_COLORS = [CHART_COLORS.brand, "#27D366", CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.gray];

export function PositionDistribution({ keywords }: { keywords: SEOTrackingRow[] }) {
  const copy = COPY.seoAnalytics.search.positionDistribution;
  const data = buildPositionDistribution(keywords);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="bucket" {...chartAxisProps} />
            <YAxis {...chartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.bucket}</p>
                    <p className="text-textSecondary">{row.count} keywords ({formatPercent(row.pct)})</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.bucket} fill={BUCKET_COLORS[index] ?? CHART_COLORS.gray} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
