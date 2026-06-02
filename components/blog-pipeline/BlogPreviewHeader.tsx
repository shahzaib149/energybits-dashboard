import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogPublishButton } from "@/components/blog-pipeline/BlogPublishButton";

export function BlogPreviewHeader({
  recordId,
  blogTitle,
  canPublish,
  blogStatus
}: {
  recordId: string;
  blogTitle: string;
  canPublish: boolean;
  blogStatus: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link
        href="/blog-pipeline/status"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog Pipeline
      </Link>
      <BlogPublishButton recordId={recordId} blogTitle={blogTitle} canPublish={canPublish} blogStatus={blogStatus} />
    </div>
  );
}
