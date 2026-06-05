import type { DataBounds, DateRange, DateRangePreset, ParseDateRangeResult } from "@/lib/date-range/types";

const PRESET_PRESETS: DateRangePreset[] = ["7d", "14d", "21d", "28d"];

const DAYS_MAP: Record<Exclude<DateRangePreset, "custom">, number> = {
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
  const from = subtractDays(today, 28);
  return {
    preset: "28d",
    from: formatYYYYMMDD(from),
    to: formatYYYYMMDD(today)
  };
}

/**
 * Standard date-range parser for pages without data bounds.
 * Anchors "last X days" to today. Only handles [7d, 14d, 21d, 28d] presets.
 */
export function parseDateRange(
  searchParams: Record<string, string | undefined>
): ParseDateRangeResult {
  const raw = searchParams.dateRange;
  const preset = PRESET_PRESETS.includes(raw as DateRangePreset)
    ? (raw as DateRangePreset)
    : "28d";

  const today = todayLocal();
  const days = DAYS_MAP[preset as Exclude<DateRangePreset, "custom">];
  const from = subtractDays(today, days);

  return {
    range: { preset, from: formatYYYYMMDD(from), to: formatYYYYMMDD(today) },
    invalid: false,
    clampedToFuture: false
  };
}

/**
 * Bounds-aware date-range parser for pages that know their actual data range.
 *
 * Key behaviour:
 * - Anchors "last X days" to bounds.maxDate (not today), so the filter always
 *   shows real data even when the latest sync was yesterday or a week ago.
 * - Supports ?days=N   → last N days ending at maxDate
 * - Supports ?dateRange=custom&from=&to=  → explicit date range
 * - Supports ?dateRange=7d/14d/21d/28d    → preset relative to maxDate
 * - Falls back to full available range when no filter is set
 */
export function parseDateRangeWithBounds(
  searchParams: Record<string, string | undefined>,
  bounds: DataBounds | null
): ParseDateRangeResult {
  const todayStr = formatYYYYMMDD(todayLocal());

  // Anchor to actual latest data date; never go beyond today
  const anchor = bounds?.maxDate
    ? bounds.maxDate > todayStr
      ? todayStr
      : bounds.maxDate
    : todayStr;

  // ── Custom date range ─────────────────────────────────────────────
  const rawPreset = searchParams.dateRange;
  if (rawPreset === "custom") {
    const from = searchParams.from ?? "";
    const to = searchParams.to ?? "";
    if (!isValidYYYYMMDD(from) || !isValidYYYYMMDD(to) || from > to) {
      return { range: defaultRangeAnchored(anchor, bounds), invalid: true, clampedToFuture: false };
    }
    const clampedTo = to > todayStr ? todayStr : to;
    return {
      range: { preset: "custom", from, to: clampedTo },
      invalid: false,
      clampedToFuture: to > todayStr
    };
  }

  // ── Custom day count (?days=N) ────────────────────────────────────
  const daysParam = searchParams.days;
  if (daysParam) {
    const n = parseInt(daysParam, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 366) {
      const anchorDate = new Date(`${anchor}T12:00:00`);
      const from = subtractDays(anchorDate, n - 1);
      return {
        range: { preset: "custom", from: formatYYYYMMDD(from), to: anchor, customDays: n },
        invalid: false,
        clampedToFuture: false
      };
    }
  }

  // ── Named preset (?dateRange=7d etc) ─────────────────────────────
  if (rawPreset && PRESET_PRESETS.includes(rawPreset as DateRangePreset)) {
    const preset = rawPreset as Exclude<DateRangePreset, "custom">;
    const days = DAYS_MAP[preset];
    const anchorDate = new Date(`${anchor}T12:00:00`);
    const from = subtractDays(anchorDate, days - 1);
    return {
      range: { preset, from: formatYYYYMMDD(from), to: anchor },
      invalid: false,
      clampedToFuture: false
    };
  }

  // ── Default: last 28 days from anchor ────────────────────────────
  return { range: defaultRangeAnchored(anchor, bounds), invalid: false, clampedToFuture: false };
}

function defaultRangeAnchored(anchor: string, bounds: DataBounds | null): DateRange {
  const anchorDate = new Date(`${anchor}T12:00:00`);
  const from = subtractDays(anchorDate, 27); // 28 days inclusive
  // Don't go before earliest available data
  const effectiveFrom =
    bounds?.minDate && formatYYYYMMDD(from) < bounds.minDate ? bounds.minDate : formatYYYYMMDD(from);
  return { preset: "28d", from: effectiveFrom, to: anchor };
}

export function isRangeOlderThanMonths(range: DateRange, months: number): boolean {
  const from = new Date(`${range.from}T12:00:00`);
  const cutoff = subtractDays(todayLocal(), months * 30);
  return from < cutoff;
}
