"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";
import { COPY } from "@/lib/copy";
import { aggregateByDay, buildCountsBreakdown, metricColor, topMetricsByCounts } from "@/lib/klaviyo/metrics";
import { KLAVIYO_CHART_COLORS, klaviyoChartAxisProps } from "@/components/klaviyo/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrency, formatCurrencyCompact, formatDate, formatNumber } from "@/lib/utils/format";

function truncate(value: string, max = 28) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function OverviewTab({ rows }: { rows: KlaviyoAnalyticsRow[] }) {
  const copy = COPY.klaviyo.overview;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-textMuted">{COPY.dateRange.emptyForRange}</p>
      </div>
    );
  }

  const trend = aggregateByDay(rows).map((row) => ({
    ...row,
    label: formatDate(row.day)
  }));
  const topMetrics = topMetricsByCounts(rows, 8).map((row) => ({
    name: truncate(row.metricName),
    fullName: row.metricName,
    counts: row.counts,
    uniqueCounts: row.uniqueCounts
  }));
  const breakdown = buildCountsBreakdown(rows).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={copy.eventsTrend.title} subtitle={copy.eventsTrend.subtitle} />
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={KLAVIYO_CHART_COLORS.grid} />
                <XAxis dataKey="label" {...klaviyoChartAxisProps} />
                <YAxis tickFormatter={(value) => formatNumber(value)} {...klaviyoChartAxisProps} />
                <Tooltip
                  contentStyle={{
                    background: KLAVIYO_CHART_COLORS.surface,
                    border: `1px solid ${KLAVIYO_CHART_COLORS.grid}`
                  }}
                  formatter={(value: number, name: string) => [
                    name === "orderSumValue" ? formatCurrency(value) : formatNumber(value),
                    name === "orderSumValue" ? "Order value" : name === "uniqueCounts" ? "Unique contacts" : "Events"
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="counts"
                  stroke={KLAVIYO_CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={false}
                  name="counts"
                />
                <Line
                  type="monotone"
                  dataKey="uniqueCounts"
                  stroke={KLAVIYO_CHART_COLORS.accent}
                  strokeWidth={2}
                  dot={false}
                  name="uniqueCounts"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={copy.topMetrics.title} subtitle={copy.topMetrics.subtitle} />
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMetrics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={KLAVIYO_CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => formatNumber(value)} {...klaviyoChartAxisProps} />
                <YAxis type="category" dataKey="name" width={120} {...klaviyoChartAxisProps} />
                <Tooltip
                  contentStyle={{
                    background: KLAVIYO_CHART_COLORS.surface,
                    border: `1px solid ${KLAVIYO_CHART_COLORS.grid}`
                  }}
                  formatter={(value: number) => [formatNumber(value), "Events"]}
                />
                <Bar dataKey="counts" fill={KLAVIYO_CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6">
        <SectionTitle title={copy.metricBreakdown.title} subtitle={copy.metricBreakdown.subtitle} />
        <div className="space-y-3">
          {breakdown.map((row, index) => (
            <div key={row.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-textPrimary">{truncate(row.name, 40)}</span>
                <span className="text-textSecondary">{formatNumber(row.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surfaceElevated">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max((row.value / (breakdown[0]?.value || 1)) * 100, 4)}%`,
                    backgroundColor: metricColor(index)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {trend.some((row) => row.orderSumValue > 0) ? (
        <section className="rounded-xl border border-border bg-surface p-6">
          <SectionTitle title={copy.revenueTrend.title} subtitle={copy.revenueTrend.subtitle} />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={KLAVIYO_CHART_COLORS.grid} />
                <XAxis dataKey="label" {...klaviyoChartAxisProps} />
                <YAxis tickFormatter={(value) => formatCurrencyCompact(value)} {...klaviyoChartAxisProps} />
                <Tooltip
                  contentStyle={{
                    background: KLAVIYO_CHART_COLORS.surface,
                    border: `1px solid ${KLAVIYO_CHART_COLORS.grid}`
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Order value"]}
                />
                <Line
                  type="monotone"
                  dataKey="orderSumValue"
                  stroke={KLAVIYO_CHART_COLORS.secondary}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}
    </div>
  );
}
