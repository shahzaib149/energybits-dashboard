import type { Metadata } from "next";
import Link from "next/link";
import { getAirtableClient } from "@/lib/airtable/client";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { COPY } from "@/lib/copy";
import { PipelineStatusTable } from "@/components/blog-pipeline/PipelineStatusTable";
import { isSEOAnalyticsConfigured } from "@/lib/seo-analytics/env";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: COPY.blogPipeline.meta.title,
  description: COPY.blogPipeline.meta.description
};

export const dynamic = "force-dynamic";

export default async function BlogPipelineStatusPage() {
  const user = await getServerUser();
  const canEdit = user !== null && permissions.canEditBlogTopic(user.role);
  const copy = COPY.blogPipeline;

  if (!isSEOAnalyticsConfigured()) {
    return (
      <div className="overview-theme mx-auto max-w-[1400px] p-6 lg:p-8">
        <EmptyState title={copy.loadError} description={COPY.seoAnalytics.notConfigured.description} />
      </div>
    );
  }

  const rows = await getAirtableClient().getBlogPipeline();

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Workflow</p>
          <h1 className="mt-1 text-2xl font-semibold text-textPrimary">{copy.title}</h1>
          <p className="mt-1 text-sm text-textSecondary">{copy.subtitle}</p>
        </div>
        <Link
          href="/blog-pipeline"
          className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium text-textSecondary hover:border-brand/40 hover:text-brand"
        >
          {copy.submitCta}
        </Link>
      </header>

      <PipelineStatusTable initialRows={rows} canEdit={canEdit} />
    </div>
  );
}
