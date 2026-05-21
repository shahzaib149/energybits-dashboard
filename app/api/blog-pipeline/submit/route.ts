import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  buildSubmitWebhookPayload,
  fieldsToAirtable,
  mergeSubmitFields
} from "@/lib/blog-pipeline/build-submit-prompt";
import {
  fetchBlogRecommendations,
  findAeoById,
  findKeywordById
} from "@/lib/blog-pipeline/recommendations";
import { triggerBlogCreationWebhook } from "@/lib/blog-pipeline/trigger-webhook";
import type { BlogSubmitInput } from "@/lib/blog-pipeline/submit-types";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { mapBlogPipelineRecord } from "@/lib/airtable/blog-pipeline";

async function createBlogRecord(fields: Record<string, unknown>) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!baseId || !apiKey) throw new Error("Airtable is not configured");

  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== "")
  );

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Blog Pipeline")}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: safeFields })
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      typeof error === "object" && error !== null && "error" in error
        ? JSON.stringify(error)
        : "Failed to create blog record"
    );
  }

  return (await response.json()) as { id: string; fields: Record<string, unknown> };
}

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!permissions.canSubmitBlogTopic(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as BlogSubmitInput;
  const blogTitle = body.blogTitle?.trim();
  if (!blogTitle) {
    return NextResponse.json({ error: "Blog title is required" }, { status: 400 });
  }

  const { keywords, aeoPrompts } = await fetchBlogRecommendations();
  const keyword = findKeywordById(keywords, body.keywordId);
  const aeo = findAeoById(aeoPrompts, body.aeoPromptId);
  const merged = mergeSubmitFields(body, keyword, aeo);
  const airtableFields = fieldsToAirtable(merged, user.email, {
    keywordId: body.keywordId,
    aeoPromptId: body.aeoPromptId
  });
  const triggeredAt = new Date().toISOString();

  let record: { id: string; fields: Record<string, unknown> };
  try {
    record = await createBlogRecord(airtableFields);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    console.error("[blog-pipeline/submit] Airtable create failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const payload = buildSubmitWebhookPayload(
    record.id,
    body,
    keyword,
    aeo,
    user.email,
    triggeredAt,
    { ...record.fields, ...airtableFields }
  );

  const webhookResult = await triggerBlogCreationWebhook(payload);
  const { ipAddress, userAgent } = getRequestContext(request);

  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    action: "blog.topic_submitted",
    resourceType: "blog_pipeline",
    resourceId: record.id,
    metadata: {
      blogTitle: merged.blogTitle,
      keywordId: body.keywordId,
      aeoPromptId: body.aeoPromptId,
      webhookOk: webhookResult.ok,
      triggeredAt
    },
    ipAddress,
    userAgent
  });

  const row = mapBlogPipelineRecord({ id: record.id, fields: record.fields });

  revalidatePath("/blog-pipeline/status");

  if (!webhookResult.ok) {
    return NextResponse.json(
      {
        record: row,
        webhookError: webhookResult.message,
        warning: "Blog row created but Make.com trigger failed"
      },
      { status: 207 }
    );
  }

  return NextResponse.json({ record: row, webhookOk: true });
}
