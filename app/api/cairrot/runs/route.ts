import { NextRequest } from "next/server";
import { cairrotJsonRoute, getCairrotClientLazy } from "@/lib/cairrot/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
  return cairrotJsonRoute(async () => {
    const client = await getCairrotClientLazy();
    return client.listRuns(limit);
  });
}
