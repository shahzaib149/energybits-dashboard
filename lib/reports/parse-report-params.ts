import { dateRangeFromDays } from "@/lib/reports/combined-intelligence";
import type { DateRange } from "@/lib/date-range/types";

export function parseReportDateRange(searchParams: URLSearchParams): DateRange {
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (from && to) {
    return { preset: "custom", from, to };
  }

  const days = parseInt(searchParams.get("days") ?? "28", 10);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 28;
  return dateRangeFromDays(safeDays);
}

export function reportQueryFromDateRange(dateRange: DateRange): URLSearchParams {
  const query = new URLSearchParams();
  const daysMap: Record<string, number> = { "7d": 7, "14d": 14, "21d": 21, "28d": 28 };
  query.set("days", String(daysMap[dateRange.preset] ?? 28));
  return query;
}
