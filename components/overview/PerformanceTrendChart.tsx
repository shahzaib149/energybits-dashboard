"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from "recharts";
import type { RunOverview } from "@/lib/cairrot/types";
import { buildRunTrendPoints, getUniqueProviders, providerColor } from "@/lib/cairrot/trends";
import {
  OVERVIEW_CHART_COLORS,
  OVERVIEW_TREND_COLORS,
  overviewChartTooltipStyle,
  overviewChartAxisProps
} from "@/components/overview/chartTheme";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatDateShort } from "@/lib/date-range/format";
import { formatNumber } from "@/lib/utils/format";

interface PerformanceTrendChartProps {
  runs: RunOverview[];
}

export function PerformanceTrendChart({ runs }: PerformanceTrendChartProps) {
  if (runs.length < 2) return null;

  const providers = getUniqueProviders(runs);
  const chartData = buildRunTrendPoints(runs).map((point) => ({
    ...point,
    label: formatDateShort(point.period.slice(0, 10))
  }));

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle
        title="Citations, Responses & LLM Mix"
        subtitle="AEO visibility across recent prompt runs"
      />
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={OVERVIEW_CHART_COLORS.grid} />
            <XAxis dataKey="label" {...overviewChartAxisProps} />
            <YAxis yAxisId="left" tickFormatter={(v) => formatNumber(v)} {...overviewChartAxisProps} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => formatNumber(v)}
              {...overviewChartAxisProps}
            />
            <Tooltip content={<PerformanceTooltip />} />
            <Legend wrapperStyle={{ color: OVERVIEW_CHART_COLORS.text, fontSize: 12 }} />
            {providers.map((provider) => (
              <Bar
                key={provider}
                yAxisId="right"
                dataKey={provider}
                stackId="providers"
                fill={providerColor(provider)}
                name={provider}
              />
            ))}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="citations"
              stroke={OVERVIEW_TREND_COLORS.citations}
              strokeWidth={2}
              dot={{ r: 4, fill: OVERVIEW_TREND_COLORS.citations }}
              name="Citations"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="responses"
              stroke={OVERVIEW_TREND_COLORS.responses}
              strokeWidth={2}
              dot={{ r: 4, fill: OVERVIEW_TREND_COLORS.responses }}
              name="Responses"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function PerformanceTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const entries = payload.filter((entry) => entry.value !== undefined && entry.value !== null);
  if (entries.length === 0) return null;

  return (
    <div style={overviewChartTooltipStyle} className="px-3 py-2 text-xs">
      {label ? <p className="mb-1 font-medium text-white">{label}</p> : null}
      {entries.map((entry) => (
        <p key={String(entry.name)} className="text-textSecondary">
          {entry.name}: <span className="text-white">{formatNumber(entry.value as number)}</span>
        </p>
      ))}
    </div>
  );
}
