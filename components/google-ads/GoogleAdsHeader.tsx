import type { ReactNode } from "react";
import { COPY } from "@/lib/copy";
import { formatDate } from "@/lib/utils/format";
import type { DateRange } from "@/lib/date-range/types";
import { formatDateRangeLabel } from "@/lib/date-range/format";

export interface GoogleAdsHeaderProps {
  lastUpdated: string | null;
  campaignCount: number;
  accountName: string | null;
  dateRange: DateRange;
  dateRangePicker: ReactNode;
}

export function GoogleAdsHeader({
  lastUpdated,
  campaignCount,
  accountName,
  dateRange,
  dateRangePicker
}: GoogleAdsHeaderProps) {
  const copy = COPY.googleAds.header;

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-amber-400/90">{copy.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">{copy.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-textSecondary">{copy.subtitle}</p>
        <p className="mt-2 text-xs text-textMuted">
          {accountName ? `${accountName} · ` : ""}
          {campaignCount.toLocaleString()} campaigns synced · {formatDateRangeLabel(dateRange)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {dateRangePicker}
        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
          Google Ads
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
