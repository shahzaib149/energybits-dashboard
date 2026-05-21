import type { Metadata } from "next";
import { getAirtableClient } from "@/lib/airtable/client";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { COPY } from "@/lib/copy";
import { BlogPipelineStatusView } from "@/components/blog-pipeline/BlogPipelineStatusView";
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
    <div className="overview-theme mx-auto w-full max-w-[1400px] p-3 sm:p-6 lg:p-8">
      <BlogPipelineStatusView initialRows={rows} canEdit={canEdit} />
    </div>
  );
}
