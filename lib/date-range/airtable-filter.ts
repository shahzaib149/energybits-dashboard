import type { DateRange } from "@/lib/date-range/types";

// Noon anchor avoids DST edge cases (matches parse.ts convention).
function addOneDay(yyyymmdd: string): string {
  const d = new Date(`${yyyymmdd}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Date range filter for Airtable date/datetime fields.
 * Lower bound is inclusive (>=). Upper bound is exclusive (<) using end_date+1
 * so that Airtable datetime fields (e.g. "2026-05-31T23:00:00Z") are not
 * mistakenly cut off when Airtable parses the bare date string as midnight.
 */
export function dateFieldInRangeFormula(fieldName: string, range: DateRange): string {
  return `AND({${fieldName}} >= "${range.from}", {${fieldName}} < "${addOneDay(range.to)}")`;
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

/** Campaign rows span Date Start–Date Stop; include any campaign active during the range. */
export function metaCampaignDateInRangeFormula(range: DateRange): string {
  return `AND({Date Start} < "${addOneDay(range.to)}", OR({Date Stop} = BLANK(), {Date Stop} >= "${range.from}"))`;
}

export function metaAdInsightsDateInRangeFormula(range: DateRange): string {
  return dateFieldInRangeFormula("date_start", range);
}

export function combineFormulas(...parts: Array<string | undefined>): string | undefined {
  const valid = parts.filter((p): p is string => Boolean(p));
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  return `AND(${valid.join(", ")})`;
}
