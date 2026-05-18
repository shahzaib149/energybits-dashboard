import { Suspense } from "react";
import { BlogPipelineTable } from "@/components/BlogPipelineTable";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { fetchTable, fetchTableSchema, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { filterBlogPipelineRecords } from "@/lib/blogRecords";
import { BlogPipelineFields } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

async function BlogPipelineContent() {
  const [records, schema] = await Promise.all([
    fetchTable<BlogPipelineFields>("Blog Pipeline"),
    fetchTableSchema("Blog Pipeline")
  ]);
  const recordsWithData = filterBlogPipelineRecords(records);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Blogs</h1>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">{formatNumber(recordsWithData.length)}</span>
      </div>
      <BlogPipelineTable records={recordsWithData} schema={schema} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <BlogPipelineContent />
    </Suspense>
  );
}
