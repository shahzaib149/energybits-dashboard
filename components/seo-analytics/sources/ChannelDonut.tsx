"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChannelBreakdownRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { channelColor } from "@/lib/seo-analytics/metrics";
import { CHART_COLORS } from "@/components/seo-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatNumber } from "@/lib/utils/format";

export function ChannelDonut({ channels }: { channels: ChannelBreakdownRow[] }) {
  const copy = COPY.seoAnalytics.sources.channelDonut;
  const totalSessions = channels.reduce((sum, row) => sum + row.sessions, 0);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="relative h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={channels} dataKey="sessions" nameKey="channel" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2}>
              {channels.map((entry) => (
                <Cell key={entry.channel} fill={channelColor(entry.channel)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as ChannelBreakdownRow;
                return (
                  <div style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.channel}</p>
                    <p className="text-textSecondary">{formatNumber(row.sessions)} sessions ({row.pct.toFixed(1)}%)</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-textMuted">Total Traffic</p>
          <p className="text-xl font-bold tabular-nums text-textPrimary">{formatNumber(totalSessions)}</p>
        </div>
      </div>
    </section>
  );
}
