import type { ReactNode } from "react";
import { COPY } from "@/lib/copy";
import { formatDate } from "@/lib/utils/format";
import type { DateRange } from "@/lib/date-range/types";
import { formatDateRangeLabel } from "@/lib/date-range/format";

export interface CriteoAdsHeaderProps {
  lastUpdated: string | null;
  campaignCount: number;
  recordCount: number;
  dateRange: DateRange;
  dateRangePicker: ReactNode;
}

export function CriteoAdsHeader({
  lastUpdated,
  campaignCount,
  recordCount,
  dateRange,
  dateRangePicker
}: CriteoAdsHeaderProps) {
  const copy = COPY.criteoAds.header;

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-orange-400/90">{copy.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">{copy.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-textSecondary">{copy.subtitle}</p>
        <p className="mt-2 text-xs text-textMuted">
          {campaignCount.toLocaleString()} campaigns · {recordCount.toLocaleString()} daily rows ·{" "}
          {formatDateRangeLabel(dateRange)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {dateRangePicker}
        <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-300">
          Criteo
        </span>
        {lastUpdated ? (
          <span className="rounded-md border border-border bg-surfaceElevated px-3 py-1.5 text-xs text-textMuted">
            {copy.lastUpdated} {formatDate(lastUpdated)}
          </span>
        ) : null}
      </div>
    </header>
  );
}
