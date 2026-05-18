import { cairrotJsonRoute, getCairrotClientLazy } from "@/lib/cairrot/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return cairrotJsonRoute(async () => {
    const client = await getCairrotClientLazy();
    return client.getProjectDashboard();
  });
}
