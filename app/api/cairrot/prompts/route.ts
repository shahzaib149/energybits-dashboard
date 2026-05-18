import { NextRequest } from "next/server";
import { cairrotJsonRoute, getCairrotClientLazy } from "@/lib/cairrot/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");
  return cairrotJsonRoute(async () => {
    const client = await getCairrotClientLazy();
    if (runId) {
      return client.getPrompts(runId);
    }
    return client.getAllPrompts();
  });
}
