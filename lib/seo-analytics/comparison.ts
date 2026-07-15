export interface MetricDelta {
  current: number;
  previous: number;
  changePercent: number | null;
  direction: "up" | "down" | "flat";
}

export function computeMetricDelta(current: number, previous: number): MetricDelta {
  if (previous === 0 && current === 0) {
    return { current, previous, changePercent: 0, direction: "flat" };
  }
  if (previous === 0) {
    return { current, previous, changePercent: null, direction: "up" };
  }
  const changePercent = ((current - previous) / Math.abs(previous)) * 100;
  const direction = Math.abs(changePercent) < 0.5 ? "flat" : changePercent > 0 ? "up" : "down";
  return { current, previous, changePercent, direction };
}

export function formatDelta(delta: MetricDelta): string {
  if (delta.changePercent === null) return "New";
  if (delta.direction === "flat") return "0%";
  const sign = delta.changePercent > 0 ? "+" : "";
  return `${sign}${delta.changePercent.toFixed(1)}%`;
}
