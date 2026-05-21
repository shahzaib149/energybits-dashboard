import type { ReactNode } from "react";
import { COPY } from "@/lib/copy";
import { formatDate } from "@/lib/utils/format";
import type { DateRange } from "@/lib/date-range/types";
import { formatDateRangeLabel } from "@/lib/date-range/format";

export interface SEOAnalyticsHeaderProps {
  lastUpdated: string | null;
  totalKeywords: number;
  dateRange: DateRange;
  dateRangePicker: ReactNode;
}

export function SEOAnalyticsHeader({
  lastUpdated,
  totalKeywords,
  dateRange,
  dateRangePicker
}: SEOAnalyticsHeaderProps) {
  const copy = COPY.seoAnalytics.header;

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">{copy.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">{copy.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-textSecondary">{copy.subtitle}</p>
        <p className="mt-2 text-xs text-textMuted">
          Tracking {totalKeywords.toLocaleString()} keyword rows · {formatDateRangeLabel(dateRange)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {dateRangePicker}
        {lastUpdated ? (
          <span className="rounded-md border border-border bg-surfaceElevated px-3 py-1.5 text-xs text-textMuted">
            {copy.lastUpdated} {formatDate(lastUpdated)}
          </span>
        ) : null}
      </div>
    </header>
  );
}
