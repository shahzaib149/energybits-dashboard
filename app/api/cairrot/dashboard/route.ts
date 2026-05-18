import { cairrotJsonRoute, getCairrotClientLazy } from "@/lib/cairrot/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const runId = new URL(request.url).searchParams.get("runId") ?? undefined;
  return cairrotJsonRoute(async () => {
    const client = await getCairrotClientLazy();
    return client.getFullDashboard(runId);
  });
}
