import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { buildBlogSyncPayload } from "@/lib/blog-pipeline/sync-payload";
import { triggerBlogSyncWebhook } from "@/lib/blog-pipeline/sync-webhook";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { BlogPipelineFields } from "@/lib/types";

async function fetchBlogRecord(recordId: string) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!baseId || !apiKey) return null;

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Blog Pipeline")}/${recordId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store"
  });

  if (!response.ok) return null;
  return (await response.json()) as { id: string; fields: BlogPipelineFields };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!permissions.canPublishBlog(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const record = await fetchBlogRecord(params.id);
  if (!record) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const { ipAddress, userAgent } = getRequestContext(request);
  const triggeredAt = new Date().toISOString();

  const payload = buildBlogSyncPayload(
    { id: record.id, fields: record.fields },
    {
      event: "publish_triggered",
      triggeredBy: user.email,
      triggeredAt,
      fieldsChanged: []
    }
  );

  const result = await triggerBlogSyncWebhook(payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    action: "blog.publish_triggered",
    resourceType: "blog_topic",
    resourceId: record.id,
    metadata: {
      blogTitle: payload.content.blogTitle,
      blogStatus: payload.content.blogStatus,
      triggeredAt
    },
    ipAddress,
    userAgent
  });

  return NextResponse.json({ ok: true, recordId: record.id });
}
