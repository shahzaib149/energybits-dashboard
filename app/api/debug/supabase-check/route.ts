import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return NextResponse.json({
      status: "no_client",
      message: "SUPABASE_SERVICE_ROLE_KEY is not set — Supabase writes are skipped"
    });
  }

  // Try reading cron_settings
  const { data: readData, error: readError } = await supabase
    .from("cron_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({
      status: "read_error",
      error: readError.message,
      hint: readError.hint,
      details: readError.details,
      message: "cron_settings table read failed — table may not exist or RLS is blocking access"
    });
  }

  // Try upserting
  const { error: writeError } = await supabase
    .from("cron_settings")
    .upsert({ id: 1, enabled: false, updated_at: new Date().toISOString() }, { onConflict: "id" });

  if (writeError) {
    return NextResponse.json({
      status: "write_error",
      error: writeError.message,
      hint: writeError.hint,
      details: writeError.details,
      currentRow: readData,
      message: "cron_settings read works but write failed — likely missing column or RLS policy"
    });
  }

  return NextResponse.json({
    status: "ok",
    message: "Supabase cron_settings read + write both work",
    currentRow: readData
  });
}
