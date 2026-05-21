import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { getAirtableClient } from "@/lib/airtable/client";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";

type DismissBody = {
  actionKey: string;
  source: string;
  recordId?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!permissions.canDismissTopAction(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as DismissBody;
  if (!body.actionKey || !body.source) {
    return NextResponse.json({ error: "Missing actionKey or source" }, { status: 400 });
  }

  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    if (body.source === "seo" && body.recordId) {
      await getAirtableClient().updateActionStatus(body.recordId, "Done");
    } else {
      const supabase = await createClient();
      const { error } = await supabase.from("dismissed_actions").upsert(
        {
          action_key: body.actionKey,
          source: body.source,
          user_id: user.id,
          metadata: body.metadata ?? {},
          dismissed_at: new Date().toISOString()
        },
        { onConflict: "action_key" }
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "overview.action_dismissed",
      resourceType: body.source,
      resourceId: body.recordId ?? body.actionKey,
      metadata: body.metadata ?? {},
      ipAddress,
      userAgent
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Dismiss failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
