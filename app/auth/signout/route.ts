import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { logAuditEvent, getRequestContext } from "@/lib/audit/logger";

export async function POST(request: Request) {
  const user = await getServerUser();
  const { ipAddress, userAgent } = getRequestContext(request);

  if (user) {
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: "auth.logout",
      ipAddress,
      userAgent
    });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}
