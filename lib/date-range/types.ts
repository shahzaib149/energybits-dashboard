export type DateRangePreset = "7d" | "28d" | "90d" | "12m" | "custom";

export interface DateRange {
  preset: DateRangePreset;
  from: string;
  to: string;
}

export interface ParseDateRangeResult {
  range: DateRange;
  invalid: boolean;
  clampedToFuture: boolean;
}
