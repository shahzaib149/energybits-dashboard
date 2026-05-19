"use client";

/** Google Ads page uses amber/gold for spend + Google blue for paid search accents. */
export const ADS_CHART_COLORS = {
  primary: "#F59E0B",
  googleBlue: "#4285F4",
  brand: "#1FBA5A",
  red: "#EF4444",
  orange: "#F59E0B",
  purple: "#A855F7",
  cyan: "#06B6D4",
  yellow: "#FBBF24",
  gray: "#71717A",
  grid: "#2A2A30",
  text: "#A1A1AA",
  surface: "#16161A"
};

export const adsChartAxisProps = {
  stroke: ADS_CHART_COLORS.text,
  tick: { fill: ADS_CHART_COLORS.text, fontSize: 12 },
  axisLine: { stroke: ADS_CHART_COLORS.grid },
  tickLine: { stroke: ADS_CHART_COLORS.grid }
};

export function adsTooltipStyle() {
  return {
    background: ADS_CHART_COLORS.surface,
    border: `1px solid ${ADS_CHART_COLORS.grid}`,
    borderRadius: 8,
    color: "#FFFFFF"
  };
}
