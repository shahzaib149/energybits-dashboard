import { airtableJsonRoute, getAirtableClientLazy } from "@/lib/airtable/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: Request) {
  const limit = new URL(request.url).searchParams.get("limit")
    ? parseInt(new URL(request.url).searchParams.get("limit")!, 10)
    : 50;

  return airtableJsonRoute(async () => {
    const client = await getAirtableClientLazy();
    const [records, channels] = await Promise.all([
      client.getTrafficSources(limit),
      client.getChannelBreakdown()
    ]);
    return { records, channels };
  });
}
