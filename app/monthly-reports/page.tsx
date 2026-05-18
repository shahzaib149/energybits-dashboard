import { Suspense } from "react";
import { MonthlyReportsCards } from "@/components/MonthlyReportsCards";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { fetchTable, fetchTableSchema, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { MonthlyReportsFields } from "@/lib/types";
import { monthSortValue, formatNumber } from "@/lib/utils";

export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

async function MonthlyReportsContent() {
  const [records, schema] = await Promise.all([
    fetchTable<MonthlyReportsFields>("Monthly Reports"),
    fetchTableSchema("Monthly Reports")
  ]);
  const sorted = [...records].sort((left, right) => monthSortValue(right.fields) - monthSortValue(left.fields));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Monthly Reports</h1>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">{formatNumber(records.length)}</span>
      </div>
      <MonthlyReportsCards records={sorted} schema={schema} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MonthlyReportsContent />
    </Suspense>
  );
}
