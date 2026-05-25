import type { DateRange } from "@/lib/date-range/types";

/** Inclusive date range filter for Airtable date fields. */
export function dateFieldInRangeFormula(fieldName: string, range: DateRange): string {
  return `AND({${fieldName}} >= "${range.from}", {${fieldName}} <= "${range.to}")`;
}

export function endDateInRangeFormula(range: DateRange): string {
  return dateFieldInRangeFormula("End Date", range);
}

export function googleAdsDateInRangeFormula(range: DateRange): string {
  return dateFieldInRangeFormula("Date", range);
}

export function criteoAdsDateInRangeFormula(range: DateRange): string {
  return dateFieldInRangeFormula("Day", range);
}

export function vibeAdsDateInRangeFormula(range: DateRange): string {
  return dateFieldInRangeFormula("impression_date", range);
}

export function klaviyoDateInRangeFormula(range: DateRange): string {
  return dateFieldInRangeFormula("Date", range);
}

export function combineFormulas(...parts: Array<string | undefined>): string | undefined {
  const valid = parts.filter((p): p is string => Boolean(p));
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  return `AND(${valid.join(", ")})`;
}
