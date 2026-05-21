import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { getAirtableClient } from "@/lib/airtable/client";
import type { ActionStatus } from "@/lib/airtable/types";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";

const VALID: ActionStatus[] = ["Not Started", "In Progress", "Done", "Ignored"];

export async function PATCH(
  request: Request,
  { params }: { params: { recordId: string } }
) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!permissions.canToggleGSCStatus(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { status?: string; oldStatus?: string };
  const status = body.status as ActionStatus;
  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const updated = await getAirtableClient().updateActionStatus(params.recordId, status);

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "gsc.status_changed",
      resourceType: "seo_tracking",
      resourceId: params.recordId,
      metadata: {
        oldStatus: body.oldStatus ?? null,
        newStatus: status,
        query: updated.query
      },
      ipAddress,
      userAgent
    });

    return NextResponse.json({ record: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
