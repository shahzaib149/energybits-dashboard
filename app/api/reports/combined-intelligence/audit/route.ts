import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      days?: number;
      gapCount?: number;
      filename?: string;
    };

    const ctx = getRequestContext(request);

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "intelligence_report.downloaded",
      resourceType: "combined-intelligence-report",
      metadata: {
        days: body.days ?? 28,
        gapCount: body.gapCount ?? 0,
        filename: body.filename ?? null
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Intelligence report audit failed:", err);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
