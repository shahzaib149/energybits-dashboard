import { NextResponse } from "next/server";
import { READONLY_FIELDS } from "@/lib/editing";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { seoTableRecordUrl } from "@/lib/airtable";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tableId, fields } = (await req.json()) as {
    tableId: string;
    fields: Record<string, unknown>;
  };

  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(
      ([key, value]) => !READONLY_FIELDS.includes(key) && value !== "" && value !== undefined
    )
  );

  const isBlogTopic = typeof safeFields["Blog Title"] === "string";

  if (isBlogTopic && !permissions.canSubmitBlogTopic(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = await seoTableRecordUrl(tableId);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAirtableApiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: safeFields })
  });

  if (!res.ok) {
    const error = await res.json();

    let errorMessage = "Failed to create record";
    if (error.error?.type === "INVALID_VALUE_FOR_COLUMN") {
      errorMessage = "Invalid field value provided";
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.error,
        fields: safeFields
      },
      { status: res.status }
    );
  }

  const created = (await res.json()) as { id: string; fields: Record<string, unknown> };
  const { ipAddress, userAgent } = getRequestContext(req);

  if (isBlogTopic) {
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "blog.topic_submitted",
      resourceType: "blog_pipeline",
      resourceId: created.id,
      metadata: { title: String(safeFields["Blog Title"]) },
      ipAddress,
      userAgent
    });
  }

  return NextResponse.json(created);
}
