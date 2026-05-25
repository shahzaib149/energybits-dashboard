import type { AirtableRecordRaw, KlaviyoAnalyticsRow } from "@/lib/klaviyo/types";

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace(/,/g, "").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** Normalize Airtable date/datetime to YYYY-MM-DD. */
function asDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) return "";
  return raw.slice(0, 10);
}

export function mapKlaviyoRecord(record: AirtableRecordRaw): KlaviyoAnalyticsRow {
  const f = record.fields;

  return {
    id: record.id,
    metricId: asString(f["Metric ID"]),
    metricName: asString(f["Metric Name"]),
    date: asDate(f.Date),
    counts: asNumber(f.Counts),
    orderSumValue: asNumber(f["Order Sum Value"]),
    uniqueCounts: asNumber(f["Unique Counts"])
  };
}
