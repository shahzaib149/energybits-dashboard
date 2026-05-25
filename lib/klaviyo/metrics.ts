import type {
  KlaviyoAnalyticsRow,
  KlaviyoDailyTrendRow,
  KlaviyoMetricAggregateRow
} from "@/lib/klaviyo/types";

type MetricSum = {
  counts: number;
  uniqueCounts: number;
  orderSumValue: number;
  recordCount: number;
};

function emptySum(): MetricSum {
  return { counts: 0, uniqueCounts: 0, orderSumValue: 0, recordCount: 0 };
}

function addRow(target: MetricSum, row: KlaviyoAnalyticsRow) {
  target.counts += row.counts;
  target.uniqueCounts += row.uniqueCounts;
  target.orderSumValue += row.orderSumValue;
  target.recordCount += 1;
}

export function sumCounts(rows: KlaviyoAnalyticsRow[]) {
  return rows.reduce((sum, row) => sum + row.counts, 0);
}

export function sumUniqueCounts(rows: KlaviyoAnalyticsRow[]) {
  return rows.reduce((sum, row) => sum + row.uniqueCounts, 0);
}

export function sumOrderValue(rows: KlaviyoAnalyticsRow[]) {
  return rows.reduce((sum, row) => sum + row.orderSumValue, 0);
}

export function uniqueMetricCount(rows: KlaviyoAnalyticsRow[]) {
  return new Set(rows.map((row) => row.metricName).filter(Boolean)).size;
}

export function latestDay(rows: KlaviyoAnalyticsRow[]) {
  const days = rows.map((row) => row.date).filter(Boolean);
  return days.length ? days.sort((a, b) => b.localeCompare(a))[0] : null;
}

export function aggregateByMetricName(rows: KlaviyoAnalyticsRow[]): KlaviyoMetricAggregateRow[] {
  const map = new Map<string, MetricSum>();

  for (const row of rows) {
    const label = row.metricName || "Unknown";
    const existing = map.get(label) ?? emptySum();
    addRow(existing, row);
    map.set(label, existing);
  }

  return Array.from(map.entries())
    .map(([metricName, metrics]) => ({
      metricName,
      counts: metrics.counts,
      uniqueCounts: metrics.uniqueCounts,
      orderSumValue: metrics.orderSumValue,
      recordCount: metrics.recordCount
    }))
    .sort((a, b) => b.counts - a.counts);
}

export function aggregateByDay(rows: KlaviyoAnalyticsRow[]): KlaviyoDailyTrendRow[] {
  const map = new Map<string, MetricSum>();

  for (const row of rows) {
    const day = row.date || "Unknown";
    const existing = map.get(day) ?? emptySum();
    addRow(existing, row);
    map.set(day, existing);
  }

  return Array.from(map.entries())
    .map(([day, metrics]) => ({
      day,
      counts: metrics.counts,
      uniqueCounts: metrics.uniqueCounts,
      orderSumValue: metrics.orderSumValue
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function buildCountsBreakdown(rows: KlaviyoAnalyticsRow[]) {
  const aggregated = aggregateByMetricName(rows);
  const total = aggregated.reduce((sum, row) => sum + row.counts, 0) || 1;
  return aggregated.map((row) => ({
    name: row.metricName,
    value: row.counts,
    pct: (row.counts / total) * 100
  }));
}

export function topMetricsByCounts(rows: KlaviyoAnalyticsRow[], limit = 8) {
  return aggregateByMetricName(rows).slice(0, limit);
}

export function topMetricsByRevenue(rows: KlaviyoAnalyticsRow[], limit = 6) {
  return aggregateByMetricName(rows)
    .filter((row) => row.orderSumValue > 0)
    .sort((a, b) => b.orderSumValue - a.orderSumValue)
    .slice(0, limit);
}

export function metricColor(index: number) {
  const colors = ["#10B981", "#059669", "#34D399", "#6EE7B7", "#047857", "#064E3B", "#14B8A6", "#0D9488"];
  return colors[index % colors.length];
}
