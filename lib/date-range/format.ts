import { COPY } from "@/lib/copy";
import type { DateRange } from "@/lib/date-range/types";

/** Short human label, e.g. "May 18" or "Jan 3". */
export function formatDateShort(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

export function formatDateRangeLabel(range: DateRange): string {
  if (range.preset === "custom") {
    if (range.customDays != null) return `Last ${range.customDays} days`;
    return `${formatDateShort(range.from)} – ${formatDateShort(range.to)}`;
  }
  return COPY.dateRange.presets[range.preset];
}

export function buildDateRangeSearchParams(range: DateRange): URLSearchParams {
  const params = new URLSearchParams();
  if (range.preset === "custom") {
    if (range.customDays != null) {
      params.set("days", String(range.customDays));
    } else {
      params.set("dateRange", "custom");
      params.set("from", range.from);
      params.set("to", range.to);
    }
  } else {
    params.set("dateRange", range.preset);
  }
  return params;
}

export function exportFilenameSuffix(range?: DateRange): string {
  if (!range) return formatTodayForFilename();
  return `${range.from}-to-${range.to}`;
}

function formatTodayForFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
