import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogPreviewView } from "@/components/BlogPreviewView";
import { fetchTable, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { BlogPipelineFields } from "@/lib/types";

export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

export default async function BlogPreviewPage({ params }: { params: { recordId: string } }) {
  const records = await fetchTable<BlogPipelineFields>("Blog Pipeline");
  const record = records.find((item) => item.id === params.recordId);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/blog-pipeline"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog Pipeline
        </Link>
      </div>
      <BlogPreviewView record={record} />
    </div>
  );
}
