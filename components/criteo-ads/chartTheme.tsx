"use client";

/** Criteo page uses orange for retargeting / display accents. */
export const CRITEO_CHART_COLORS = {
  primary: "#FF6B00",
  secondary: "#F59E0B",
  brand: "#1FBA5A",
  blue: "#4285F4",
  purple: "#A855F7",
  cyan: "#06B6D4",
  gray: "#71717A",
  grid: "#2A2A30",
  text: "#A1A1AA",
  surface: "#16161A"
};

export const criteoChartAxisProps = {
  stroke: CRITEO_CHART_COLORS.text,
  tick: { fill: CRITEO_CHART_COLORS.text, fontSize: 12 },
  axisLine: { stroke: CRITEO_CHART_COLORS.grid },
  tickLine: { stroke: CRITEO_CHART_COLORS.grid }
};
