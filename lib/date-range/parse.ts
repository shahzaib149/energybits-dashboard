import type { DateRange, DateRangePreset, ParseDateRangeResult } from "@/lib/date-range/types";

const VALID_PRESETS: DateRangePreset[] = ["7d", "14d", "21d", "28d"];

const DAYS_MAP: Record<DateRangePreset, number> = {
  "7d": 7,
  "14d": 14,
  "21d": 21,
  "28d": 28
};

export function formatYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidYYYYMMDD(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const parsed = new Date(`${s}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && formatYYYYMMDD(parsed) === s;
}

function subtractDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - days);
  return result;
}

function todayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function defaultRange(): DateRange {
  const today = todayLocal();
  const from = subtractDays(today, DAYS_MAP["28d"]);
  return {
    preset: "28d",
    from: formatYYYYMMDD(from),
    to: formatYYYYMMDD(today)
  };
}

export function parseDateRange(
  searchParams: Record<string, string | undefined>
): ParseDateRangeResult {
  const raw = searchParams.dateRange;
  const preset = VALID_PRESETS.includes(raw as DateRangePreset)
    ? (raw as DateRangePreset)
    : "28d";

  const today = todayLocal();
  const days = DAYS_MAP[preset];
  const from = subtractDays(today, days);

  return {
    range: {
      preset,
      from: formatYYYYMMDD(from),
      to: formatYYYYMMDD(today)
    },
    invalid: false,
    clampedToFuture: false
  };
}

export function isRangeOlderThanMonths(range: DateRange, months: number): boolean {
  const from = new Date(`${range.from}T12:00:00`);
  const cutoff = subtractDays(todayLocal(), months * 30);
  return from < cutoff;
}
