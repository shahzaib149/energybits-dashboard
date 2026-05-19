"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GA4SourceRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { channelColor } from "@/lib/seo-analytics/metrics";
import { CHART_COLORS, chartAxisProps } from "@/components/seo-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatNumber } from "@/lib/utils/format";

export function SourceMediumBars({ sources }: { sources: GA4SourceRow[] }) {
  const copy = COPY.seoAnalytics.sources.sourceMedium;
  const data = [...sources]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10)
    .map((row) => ({
      label: `${row.source} / ${row.medium}`,
      sessions: row.sessions,
      channel: row.channelGroup
    }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} />
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" {...chartAxisProps} />
            <YAxis type="category" dataKey="label" width={160} {...chartAxisProps} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.label}</p>
                    <p className="text-textSecondary">{formatNumber(row.sessions)} sessions</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={channelColor(entry.channel)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
