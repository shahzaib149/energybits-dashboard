import { Suspense } from "react";
import { RepurposedContentGrid } from "@/components/RepurposedContentGrid";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { fetchTable, fetchTableSchema, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { RepurposedContentFields } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

async function RepurposedContent() {
  const [records, schema] = await Promise.all([
    fetchTable<RepurposedContentFields>("Repurposed Content"),
    fetchTableSchema("Repurposed Content")
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Repurposed Content</h1>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">{formatNumber(records.length)}</span>
      </div>
      <RepurposedContentGrid records={records} schema={schema} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <RepurposedContent />
    </Suspense>
  );
}
