"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GA4SourceRow } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { CHART_COLORS, chartAxisProps } from "@/components/seo-analytics/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils/format";

function aggregateByChannel(sources: GA4SourceRow[]) {
  const map = new Map<
    string,
    { channel: string; sessions: number; engagementSum: number; durationSum: number; count: number }
  >();

  for (const row of sources) {
    const channel = row.channelGroup || "Other";
    const existing = map.get(channel) ?? { channel, sessions: 0, engagementSum: 0, durationSum: 0, count: 0 };
    existing.sessions += row.sessions;
    existing.engagementSum += row.engagementRatePct * row.sessions;
    existing.durationSum += row.averageSessionDuration * row.sessions;
    existing.count += row.sessions;
    map.set(channel, existing);
  }

  return Array.from(map.values())
    .map((row) => ({
      channel: row.channel,
      sessions: row.sessions,
      engagement: row.count > 0 ? row.engagementSum / row.count : 0,
      duration: row.count > 0 ? row.durationSum / row.count : 0
    }))
    .sort((a, b) => b.sessions - a.sessions);
}

export function EngagementByChannel({ sources }: { sources: GA4SourceRow[] }) {
  const copy = COPY.seoAnalytics.sources.engagementByChannel;
  const data = aggregateByChannel(sources);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="channel" {...chartAxisProps} />
            <YAxis yAxisId="left" {...chartAxisProps} />
            <YAxis yAxisId="right" orientation="right" unit="%" {...chartAxisProps} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = data.find((entry) => entry.channel === label);
                if (!row) return null;
                return (
                  <div style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_COLORS.grid}`, borderRadius: 8, padding: 12 }} className="text-xs">
                    <p className="font-medium text-white">{row.channel}</p>
                    <p className="text-textSecondary">Sessions: {formatNumber(row.sessions)}</p>
                    <p className="text-textSecondary">Engagement: {formatPercent(row.engagement)}</p>
                    <p className="text-textSecondary">Avg duration: {formatDuration(row.duration)}</p>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="sessions" name="Sessions" fill={CHART_COLORS.brand} radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="engagement" name="Engagement %" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
