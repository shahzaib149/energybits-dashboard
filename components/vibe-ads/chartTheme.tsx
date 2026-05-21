"use client";

export const VIBE_CHART_COLORS = {
  primary: "#8B5CF6",
  secondary: "#EC4899",
  brand: "#1FBA5A",
  grid: "#2A2A30",
  text: "#A1A1AA",
  surface: "#16161A"
};

export const vibeChartAxisProps = {
  stroke: VIBE_CHART_COLORS.text,
  tick: { fill: VIBE_CHART_COLORS.text, fontSize: 12 },
  axisLine: { stroke: VIBE_CHART_COLORS.grid },
  tickLine: { stroke: VIBE_CHART_COLORS.grid }
};
