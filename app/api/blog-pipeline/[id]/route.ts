import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { getAirtableClient } from "@/lib/airtable/client";
import { EDITABLE_BLOG_FIELDS } from "@/lib/airtable/blog-pipeline";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";

function pickEditable(body: Record<string, unknown>): Record<string, unknown> {
  const allowed = new Set<string>(EDITABLE_BLOG_FIELDS);
  return Object.fromEntries(Object.entries(body).filter(([k]) => allowed.has(k)));
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

  const existing = await getAirtableClient().getBlogTopicById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.blogStatus !== "Ready") {
    return NextResponse.json({ error: "Can only edit topics before drafting starts" }, { status: 409 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const airtableFields = pickEditable(body);

  const fieldMap: Record<string, keyof typeof existing> = {
    "Blog Title": "blogTitle",
    "Suggested Blog Title": "suggestedBlogTitle",
    "Target Keyword": "targetKeyword",
    "AEO Question": "aeoQuestion",
    "Funnel Stage": "funnelStage",
    "Primary Product": "primaryProduct",
    Notes: "notes"
  };

  const previousValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};
  const fieldsChanged: string[] = [];

  for (const [field, key] of Object.entries(fieldMap)) {
    if (field in airtableFields) {
      previousValues[field] = existing[key];
      newValues[field] = airtableFields[field];
      if (previousValues[field] !== newValues[field]) {
        fieldsChanged.push(field);
      }
    }
  }

  if (fieldsChanged.length === 0) {
    return NextResponse.json({ record: existing });
  }

  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const updated = await getAirtableClient().updateBlogTopic(params.id, airtableFields);

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "blog.topic_edited",
      resourceType: "blog_topic",
      resourceId: params.id,
      metadata: { fieldsChanged, previousValues, newValues },
      ipAddress,
      userAgent
    });

    return NextResponse.json({ record: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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

  const existing = await getAirtableClient().getBlogTopicById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.blogStatus !== "Ready") {
    return NextResponse.json({ error: "Can only delete topics before drafting starts" }, { status: 409 });
  }

  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    await getAirtableClient().deleteBlogTopic(params.id);

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "blog.topic_deleted",
      resourceType: "blog_topic",
      resourceId: params.id,
      metadata: { title: existing.blogTitle, submittedAt: existing.createdTime },
      ipAddress,
      userAgent
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
