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
import type { SEOTrendPoint, ChannelTrendPoint } from "@/lib/seo-analytics/trends";
import { CHART_COLORS, TREND_COLORS, chartTooltipStyle, chartAxisProps } from "@/components/seo-analytics/chartTheme";
import { channelColor } from "@/lib/seo-analytics/metrics";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatDateShort } from "@/lib/date-range/format";
import { formatNumber } from "@/lib/utils/format";

interface PerformanceTrendChartProps {
  seoTrend: SEOTrendPoint[];
  channelTrend: ChannelTrendPoint[];
  channels: string[];
}

export function PerformanceTrendChart({ seoTrend, channelTrend, channels }: PerformanceTrendChartProps) {
  if (seoTrend.length === 0 && channelTrend.length === 0) return null;

  const seoByPeriod = new Map(seoTrend.map((d) => [d.period, d]));
  const channelByPeriod = new Map(channelTrend.map((d) => [d.period, d]));
  const periods = Array.from(new Set([...seoByPeriod.keys(), ...channelByPeriod.keys()])).sort();

  const chartData = periods.map((period) => {
    const seo = seoByPeriod.get(period);
    const channelPoint = channelByPeriod.get(period);
    const point: Record<string, string | number | undefined> = {
      label: formatDateShort(period),
      clicks: seo?.clicks ?? 0,
      impressions: seo?.impressions ?? 0
    };
    // No GA4 sync landed for this period at all — leave channel keys unset so the
    // stacked bar shows a gap instead of a misleading flat zero.
    if (channelPoint) {
      for (const channel of channels) {
        point[channel] = (channelPoint[channel] as number) ?? 0;
      }
    }
    return point;
  });

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <SectionTitle title="Clicks, Impressions & Channel Mix" subtitle="Search performance and traffic source distribution over time" />
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis dataKey="label" {...chartAxisProps} />
            <YAxis yAxisId="left" tickFormatter={(v) => formatNumber(v)} {...chartAxisProps} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatNumber(v)} {...chartAxisProps} />
            <Tooltip content={<PerformanceTooltip />} />
            <Legend wrapperStyle={{ color: CHART_COLORS.text, fontSize: 12 }} />
            {channels.map((channel) => (
              <Bar
                key={channel}
                yAxisId="right"
                dataKey={channel}
                stackId="channels"
                fill={channelColor(channel)}
                name={channel}
              />
            ))}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="clicks"
              stroke={TREND_COLORS.clicks}
              strokeWidth={2}
              dot={{ r: 4, fill: TREND_COLORS.clicks }}
              name="Clicks"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="impressions"
              stroke={TREND_COLORS.impressions}
              strokeWidth={2}
              dot={{ r: 4, fill: TREND_COLORS.impressions }}
              name="Impressions"
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
    <div style={chartTooltipStyle} className="px-3 py-2 text-xs">
      {label ? <p className="mb-1 font-medium text-white">{label}</p> : null}
      {entries.map((entry) => (
        <p key={String(entry.name)} className="text-textSecondary">
          {entry.name}: <span className="text-white">{formatNumber(entry.value as number)}</span>
        </p>
      ))}
    </div>
  );
}
