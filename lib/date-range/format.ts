import { COPY } from "@/lib/copy";
import type { DateRange } from "@/lib/date-range/types";

export function formatDateRangeLabel(range: DateRange): string {
  if (range.preset !== "custom") {
    return COPY.dateRange.presets[range.preset];
  }
  return `${range.from} – ${range.to}`;
}

export function buildDateRangeSearchParams(range: DateRange): URLSearchParams {
  const params = new URLSearchParams();
  params.set("dateRange", range.preset);
  return params;
}

export function exportFilenameSuffix(range?: DateRange): string {
  if (!range) {
    return formatTodayForFilename();
  }
  return `${range.from}-to-${range.to}`;
}

function formatTodayForFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
