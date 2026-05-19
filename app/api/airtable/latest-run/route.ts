import { airtableJsonRoute, getAirtableClientLazy } from "@/lib/airtable/api-route";
import { latestEndDate } from "@/lib/seo-analytics/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  return airtableJsonRoute(async () => {
    const client = await getAirtableClientLazy();
    const [keywords, pages, sources] = await Promise.all([
      client.getSEOKeywords({ limit: 10 }),
      client.getTopPagesBySessions(5),
      client.getTrafficSources(5)
    ]);
    return {
      lastUpdated: latestEndDate([...keywords, ...pages, ...sources]),
      keywordCount: keywords.length,
      pageCount: pages.length,
      sourceCount: sources.length
    };
  });
}
