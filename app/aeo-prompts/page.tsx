import { Suspense } from "react";
import { AEOPromptsTable } from "@/components/AEOPromptsTable";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { fetchTable, fetchTableSchema, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { AEOPromptOpportunityFields } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

async function AEOPromptsContent() {
  const [records, schema] = await Promise.all([
    fetchTable<AEOPromptOpportunityFields>("AEO Prompt Opportunities"),
    fetchTableSchema("AEO Prompt Opportunities")
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Recommended AEO Prompts</h1>
        <span className="rounded-full bg-surfaceElevated px-3 py-1 text-sm font-medium text-textPrimary">{formatNumber(records.length)}</span>
      </div>
      <AEOPromptsTable records={records} schema={schema} />
    </div>
  );
}

export default function Page() {
  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] p-3 sm:p-6 lg:p-8">
      <Suspense fallback={<TableSkeleton />}>
        <AEOPromptsContent />
      </Suspense>
    </div>
  );
}
