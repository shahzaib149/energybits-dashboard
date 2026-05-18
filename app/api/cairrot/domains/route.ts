import { NextRequest } from "next/server";
import { cairrotJsonRoute, getCairrotClientLazy } from "@/lib/cairrot/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
  if (!runId) {
    return Response.json({ error: "runId query parameter is required" }, { status: 400 });
  }
  return cairrotJsonRoute(async () => {
    const client = await getCairrotClientLazy();
    return client.getNeutralDomains(runId, limit);
  });
}
