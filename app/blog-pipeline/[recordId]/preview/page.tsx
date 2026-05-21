import { notFound } from "next/navigation";
import { BlogPreviewEditor } from "@/components/blog-pipeline/BlogPreviewEditor";
import { BlogPreviewHeader } from "@/components/blog-pipeline/BlogPreviewHeader";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { fetchTable, AIRTABLE_REVALIDATE_SECONDS } from "@/lib/airtable";
import { BlogPipelineFields } from "@/lib/types";

export const revalidate = AIRTABLE_REVALIDATE_SECONDS;

export default async function BlogPreviewPage({ params }: { params: { recordId: string } }) {
  const [records, user] = await Promise.all([
    fetchTable<BlogPipelineFields>("Blog Pipeline"),
    getServerUser()
  ]);
  const record = records.find((item) => item.id === params.recordId);

  if (!record) {
    notFound();
  }

  const canEdit = user !== null && permissions.canEditBlogTopic(user.role);
  const canPublish = user !== null && permissions.canPublishBlog(user.role);
  const blogTitle = record.fields["Blog Title"] || "Untitled Blog";

  return (
    <div className="space-y-6">
      <BlogPreviewHeader recordId={record.id} blogTitle={blogTitle} canPublish={canPublish} />
      <BlogPreviewEditor initialRecord={record} canEdit={canEdit} />
    </div>
  );
}
