import { NextResponse } from "next/server";
import { seedAuthUsers } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time setup: creates admin + user in Supabase Auth and fills profiles.role.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local, then open GET /api/auth/seed
 */
export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_AUTH_SEED !== "true") {
    return NextResponse.json({ error: "Seed disabled in production" }, { status: 403 });
  }

  const outcome = await seedAuthUsers();

  if (!outcome.ok) {
    return NextResponse.json(
      {
        error: outcome.error,
        hint: "Supabase → Project Settings → API → service_role → add as SUPABASE_SERVICE_ROLE_KEY in .env.local, restart dev server, call this URL again."
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    message: "Users and roles created. Sign in at /login",
    accounts: outcome.results
  });
}
