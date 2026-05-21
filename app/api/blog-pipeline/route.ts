import { NextResponse } from "next/server";
import { getAirtableClient } from "@/lib/airtable/client";
import { getServerUser } from "@/lib/auth/getServerUser";

export const dynamic = "force-dynamic";

/** Fresh blog pipeline list for client polling (never cached). */
export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await getAirtableClient().getBlogPipeline();
    return NextResponse.json(
      { rows },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load blog pipeline";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
