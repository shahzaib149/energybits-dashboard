import { Suspense } from "react";
import { KeywordsTable } from "@/components/KeywordsTable";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { fetchTable, fetchTableSchema, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { AirtableRecord, KeywordsFields } from "@/lib/types";
import { parseDateRange } from "@/lib/date-range/parse";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

async function KeywordsContent({ dateFrom }: { dateFrom: string }) {
  const [records, schema] = await Promise.all([
    fetchTable<KeywordsFields>("Keywords"),
    fetchTableSchema("Keywords")
  ]);

  const filtered = records.filter((r) => r.createdTime.substring(0, 10) >= dateFrom);
  const sorted = [...filtered].sort(
    (a, b) => (b.fields["Search Volume"] ?? 0) - (a.fields["Search Volume"] ?? 0)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Recommended Keywords</h1>
        <span className="rounded-full bg-surfaceElevated px-3 py-1 text-sm font-medium text-textPrimary">
          {formatNumber(sorted.length)}
        </span>
      </div>
      <KeywordsTable records={sorted as AirtableRecord<KeywordsFields>[]} schema={schema} />
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
        <KeywordsContent dateFrom={dateRange.from} />
      </Suspense>
    </div>
  );
}
