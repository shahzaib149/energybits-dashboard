export type DateRangePreset = "7d" | "14d" | "21d" | "28d";

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
