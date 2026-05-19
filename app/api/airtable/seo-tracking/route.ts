import { airtableJsonRoute, getAirtableClientLazy } from "@/lib/airtable/api-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 500;

  return airtableJsonRoute(async () => {
    const client = await getAirtableClientLazy();
    const records = await client.getSEOKeywords({ filter, limit });
    return { records };
  });
}
