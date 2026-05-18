import { cairrotJsonRoute, getCairrotClientLazy } from "@/lib/cairrot/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: { runId: string } }) {
  const { runId } = context.params;
  return cairrotJsonRoute(async () => {
    const client = await getCairrotClientLazy();
    return client.getRun(runId);
  });
}
