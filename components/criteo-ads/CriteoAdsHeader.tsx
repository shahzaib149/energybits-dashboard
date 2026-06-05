import type { ReactNode } from "react";
import { COPY } from "@/lib/copy";
import { formatDate } from "@/lib/utils/format";
import type { DataBounds, DateRange } from "@/lib/date-range/types";
import { formatDateRangeLabel, formatDateShort } from "@/lib/date-range/format";

export interface CriteoAdsHeaderProps {
  lastUpdated: string | null;
  campaignCount: number;
  recordCount: number;
  dateRange: DateRange;
  dataBounds: DataBounds | null;
  dateRangePicker: ReactNode;
}

export function CriteoAdsHeader({
  lastUpdated,
  campaignCount,
  recordCount,
  dateRange,
  dataBounds,
  dateRangePicker
}: CriteoAdsHeaderProps) {
  const copy = COPY.criteoAds.header;
  const today = new Date().toISOString().split("T")[0];

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-orange-400/90">{copy.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">{copy.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-textSecondary">{copy.subtitle}</p>
        <p className="mt-2 text-xs text-textMuted">
          {campaignCount.toLocaleString()} campaigns · {recordCount.toLocaleString()} daily rows ·{" "}
          {formatDateRangeLabel(dateRange)}
          {dateRange.from && dateRange.to
            ? ` (${formatDateShort(dateRange.from)} – ${formatDateShort(dateRange.to)})`
            : ""}
        </p>
        {dataBounds ? (
          <p className="mt-1 text-xs text-textMuted">
            <span className="font-medium text-textSecondary">Data available:</span>{" "}
            {formatDateShort(dataBounds.minDate)} – {formatDateShort(dataBounds.maxDate)}
            {dataBounds.maxDate < today ? (
              <span className="ml-1.5 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                Last sync: {formatDateShort(dataBounds.maxDate)}
              </span>
            ) : null}
          </p>
        ) : null}
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
