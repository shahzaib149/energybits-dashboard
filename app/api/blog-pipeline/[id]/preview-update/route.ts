import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { buildBlogSyncPayload } from "@/lib/blog-pipeline/sync-payload";
import { triggerBlogSyncWebhook } from "@/lib/blog-pipeline/sync-webhook";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { READONLY_FIELDS } from "@/lib/editing";
import { BlogPipelineFields } from "@/lib/types";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { getAirtableApiKey, isAirtableConfigured } from "@/lib/airtable/config/env";
import { seoTableRecordUrl } from "@/lib/airtable";

const PREVIEW_EDITABLE_FIELDS = new Set([
  "Blog Title",
  "Meta Description",
  "AI Draft",
  "Human Edited Draft"
]);

async function fetchBlogRecord(recordId: string) {
  if (!isAirtableConfigured()) {
    throw new Error("Airtable is not configured");
  }

  const url = await seoTableRecordUrl(AIRTABLE_BASES.seo.tables.blogPipeline, recordId);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getAirtableApiKey()}` },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as { id: string; fields: BlogPipelineFields };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!permissions.canEditBlogTopic(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { fields?: Record<string, unknown> };
  const incoming = body.fields ?? {};

  const airtableFields = Object.fromEntries(
    Object.entries(incoming).filter(
      ([key]) => PREVIEW_EDITABLE_FIELDS.has(key) && !READONLY_FIELDS.includes(key)
    )
  );

  if (!isAirtableConfigured()) {
    return NextResponse.json({ error: "Airtable is not configured" }, { status: 500 });
  }

  const fieldsChanged = Object.keys(airtableFields);

  if (fieldsChanged.length > 0) {
    const patchUrl = await seoTableRecordUrl(AIRTABLE_BASES.seo.tables.blogPipeline, params.id);
    const patchResponse = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getAirtableApiKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: airtableFields })
    });

    if (!patchResponse.ok) {
      const error = await patchResponse.json().catch(() => ({}));
      return NextResponse.json({ error }, { status: patchResponse.status });
    }
  }

  const record = await fetchBlogRecord(params.id);
  if (!record) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const triggeredAt = new Date().toISOString();
  const payload = buildBlogSyncPayload(
    { id: record.id, fields: record.fields },
    {
      event: "content_updated",
      triggeredBy: user.email,
      triggeredAt,
      fieldsChanged
    }
  );

  const webhookResult = await triggerBlogSyncWebhook(payload);
  const { ipAddress, userAgent } = getRequestContext(request);

  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    action: "blog.preview_synced",
    resourceType: "blog_topic",
    resourceId: params.id,
    metadata: {
      fieldsChanged,
      webhookOk: webhookResult.ok,
      triggeredAt
    },
    ipAddress,
    userAgent
  });

  if (!webhookResult.ok) {
    return NextResponse.json(
      {
        record,
        webhookError: webhookResult.message,
        warning: "Saved to Airtable but sync webhook failed"
      },
      { status: 207 }
    );
  }

  return NextResponse.json({ record, webhookOk: true });
}
