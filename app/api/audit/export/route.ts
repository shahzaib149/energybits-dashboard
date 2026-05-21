import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      resourceType?: string;
      rowCount?: number;
      filename?: string;
    };

    if (!body.resourceType) {
      return NextResponse.json({ error: "Missing resourceType" }, { status: 400 });
    }

    const ctx = getRequestContext(request);

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "data.exported",
      resourceType: body.resourceType,
      metadata: {
        rowCount: body.rowCount ?? 0,
        filename: body.filename ?? null
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Export audit log failed:", err);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
