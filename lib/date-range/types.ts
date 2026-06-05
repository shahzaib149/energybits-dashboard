export type DateRangePreset = "7d" | "14d" | "21d" | "28d" | "custom";

/** Actual min/max dates available in a data source (fetched fresh, not inferred from today). */
export interface DataBounds {
  minDate: string; // YYYY-MM-DD — earliest record date
  maxDate: string; // YYYY-MM-DD — latest record date (may be before today if sync hasn't run)
}

export interface DateRange {
  preset: DateRangePreset;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  customDays?: number; // set when user typed a custom day count (e.g. "20 days")
}

export interface ParseDateRangeResult {
  range: DateRange;
  invalid: boolean;
  clampedToFuture: boolean;
}
