"use client";

import type { TooltipProps } from "recharts";

export const CHART_COLORS = {
  brand: "#1FBA5A",
  blue: "#3B82F6",
  red: "#EF4444",
  orange: "#F59E0B",
  yellow: "#FBBF24",
  purple: "#A855F7",
  cyan: "#06B6D4",
  gray: "#71717A",
  grid: "#2A2A30",
  text: "#A1A1AA",
  surface: "#16161A"
};

export const TREND_COLORS = {
  clicks: CHART_COLORS.brand,
  impressions: CHART_COLORS.blue,
  position: CHART_COLORS.orange,
  sessions: CHART_COLORS.cyan,
  engagement: CHART_COLORS.purple,
  deltaPositive: "#34D399",
  deltaNegative: "#F87171",
  deltaFlat: CHART_COLORS.gray
};

export const chartTooltipStyle = {
  background: CHART_COLORS.surface,
  border: `1px solid ${CHART_COLORS.grid}`,
  borderRadius: "8px",
  color: "#FFFFFF"
};

export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={chartTooltipStyle} className="px-3 py-2 text-xs">
      {label ? <p className="mb-1 font-medium text-white">{label}</p> : null}
      {payload.map((entry) => (
        <p key={String(entry.name)} className="text-textSecondary">
          {entry.name}: <span className="text-white">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export const chartAxisProps = {
  stroke: CHART_COLORS.text,
  tick: { fill: CHART_COLORS.text, fontSize: 12 },
  axisLine: { stroke: CHART_COLORS.grid },
  tickLine: { stroke: CHART_COLORS.grid }
};
