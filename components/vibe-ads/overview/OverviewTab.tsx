"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VibeAnalyticsRow } from "@/lib/vibe-ads/types";
import { COPY } from "@/lib/copy";
import { aggregateByDay, aggregateByField, buildSpendBreakdown, segmentColor } from "@/lib/vibe-ads/metrics";
import { VIBE_CHART_COLORS, vibeChartAxisProps } from "@/components/vibe-ads/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatCurrencyCompact, formatDate, formatRoas } from "@/lib/utils/format";

function truncate(s: string, max = 28) {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function OverviewTab({ rows }: { rows: VibeAnalyticsRow[] }) {
  const copy = COPY.vibeAds.overview;
  const trend = aggregateByDay(rows).map((r) => ({ ...r, label: formatDate(r.day) }));
  const campaigns = aggregateByField(rows, "campaignName").slice(0, 8).map((r) => ({ name: truncate(r.label), fullName: r.label, spend: r.spend, roas: r.roas }));
  const channels = buildSpendBreakdown(rows, "channelName").slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={copy.spendTrend.title} subtitle={copy.spendTrend.subtitle} />
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={VIBE_CHART_COLORS.grid} />
                <XAxis dataKey="label" {...vibeChartAxisProps} />
                <YAxis tickFormatter={(v) => formatCurrencyCompact(v)} {...vibeChartAxisProps} />
                <Tooltip contentStyle={{ background: VIBE_CHART_COLORS.surface, border: `1px solid ${VIBE_CHART_COLORS.grid}` }} />
                <Line type="monotone" dataKey="spend" stroke={VIBE_CHART_COLORS.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={copy.topCampaigns.title} subtitle={copy.topCampaigns.subtitle} />
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={VIBE_CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrencyCompact(v)} {...vibeChartAxisProps} />
                <YAxis type="category" dataKey="name" width={120} {...vibeChartAxisProps} />
                <Tooltip contentStyle={{ background: VIBE_CHART_COLORS.surface, border: `1px solid ${VIBE_CHART_COLORS.grid}` }} />
                <Bar dataKey="spend" fill={VIBE_CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle title={copy.channelBreakdown.title} subtitle={copy.channelBreakdown.subtitle} />
        <div className="space-y-3">
          {channels.map((row, i) => (
            <div key={row.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-textPrimary">{truncate(row.name, 40)}</span>
                <span className="text-textSecondary">{formatCurrency(row.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surfaceElevated">
                <div className="h-full rounded-full" style={{ width: `${Math.max((row.value / (channels[0]?.value || 1)) * 100, 4)}%`, backgroundColor: segmentColor(i) }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
