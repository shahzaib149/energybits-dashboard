import { Suspense } from "react";
import { KeywordsTable } from "@/components/KeywordsTable";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { fetchTable, fetchTableSchema, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { AirtableRecord, KeywordsFields } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

async function KeywordsContent() {
  const [records, schema] = await Promise.all([
    fetchTable<KeywordsFields>("Keywords"),
    fetchTableSchema("Keywords")
  ]);
  const sorted = [...records].sort((left, right) => (right.fields["Search Volume"] ?? 0) - (left.fields["Search Volume"] ?? 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Recommended Keywords</h1>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">{formatNumber(records.length)}</span>
      </div>
      <KeywordsTable records={sorted as AirtableRecord<KeywordsFields>[]} schema={schema} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <KeywordsContent />
    </Suspense>
  );
}
