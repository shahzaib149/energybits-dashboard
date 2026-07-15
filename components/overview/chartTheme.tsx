export const OVERVIEW_CHART_COLORS = {
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

export const OVERVIEW_TREND_COLORS = {
  citations: OVERVIEW_CHART_COLORS.brand,
  responses: OVERVIEW_CHART_COLORS.blue
};

export const overviewChartTooltipStyle = {
  background: OVERVIEW_CHART_COLORS.surface,
  border: `1px solid ${OVERVIEW_CHART_COLORS.grid}`,
  borderRadius: "8px",
  color: "#FFFFFF"
};

export const overviewChartAxisProps = {
  stroke: OVERVIEW_CHART_COLORS.text,
  tick: { fill: OVERVIEW_CHART_COLORS.text, fontSize: 12 },
  axisLine: { stroke: OVERVIEW_CHART_COLORS.grid },
  tickLine: { stroke: OVERVIEW_CHART_COLORS.grid }
};
