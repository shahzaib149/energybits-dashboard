import { Suspense } from "react";
import { AEOTrackingTable } from "@/components/AEOTrackingTable";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { fetchTable, fetchTableSchema, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { AEOTrackingFields } from "@/lib/types";
import { parseDateRange } from "@/lib/date-range/parse";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

async function AEOTrackingContent({ dateFrom }: { dateFrom: string }) {
  const [records, schema] = await Promise.all([
    fetchTable<AEOTrackingFields>("AEO Tracking"),
    fetchTableSchema("AEO Tracking")
  ]);

  const filtered = records.filter((r) => r.createdTime.substring(0, 10) >= dateFrom);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">AEO Tracking</h1>
        <span className="rounded-full bg-surfaceElevated px-3 py-1 text-sm font-medium text-textPrimary">
          {formatNumber(filtered.length)}
        </span>
      </div>
      <AEOTrackingTable records={filtered} schema={schema} />
    </div>
  );
}

export default async function Page({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { range: dateRange, invalid: showInvalidToast } = parseDateRange(searchParams);

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] p-3 sm:p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-end">
        <Suspense fallback={<div className="h-8 w-28 animate-pulse rounded-full bg-surfaceElevated" />}>
          <DateRangePicker current={dateRange} showInvalidToast={showInvalidToast} />
        </Suspense>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <AEOTrackingContent dateFrom={dateRange.from} />
      </Suspense>
    </div>
  );
}
