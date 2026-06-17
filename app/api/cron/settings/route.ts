import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { getCronSettings, updateCronSettings } from "@/lib/cron/settings";

export const dynamic = "force-dynamic";

// GET is auth-free — the trigger status is not sensitive and auth failures
// (Supabase DNS outages) must not prevent the card from loading.
export async function GET() {
  const settings = await getCronSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  // PATCH requires admin — wrap auth in try-catch so DNS outages return a clear error
  let user: Awaited<ReturnType<typeof getServerUser>> = null;
  try {
    user = await getServerUser();
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!permissions.canManageCronSettings(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { enabled?: boolean };
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await updateCronSettings({ enabled: body.enabled });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to save setting" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, enabled: body.enabled });
}
