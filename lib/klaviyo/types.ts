export interface AirtableRecordRaw {
  id: string;
  fields: Record<string, unknown>;
}

export interface AirtableListResponse {
  records: AirtableRecordRaw[];
  offset?: string;
}

export interface KlaviyoAnalyticsRow {
  id: string;
  metricId: string;
  metricName: string;
  date: string;
  counts: number;
  orderSumValue: number;
  uniqueCounts: number;
}

export interface KlaviyoMetricAggregateRow {
  metricName: string;
  counts: number;
  uniqueCounts: number;
  orderSumValue: number;
  recordCount: number;
}

export interface KlaviyoDailyTrendRow {
  day: string;
  counts: number;
  uniqueCounts: number;
  orderSumValue: number;
}
