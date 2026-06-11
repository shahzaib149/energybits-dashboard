import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getAirtableClient } from "@/lib/airtable/client";
import { rankKeywords, rankAEOPrompts } from "@/lib/blog-pipeline/recommendations";
import type { RecommendationsResponse } from "@/lib/blog-pipeline/submit-types";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 8;

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title")?.trim() ?? "";

  try {
    const client = getAirtableClient();
    const [allKeywords, allPrompts] = await Promise.all([
      client.getKeywordsForBlog(),
      client.getAEOPromptsForBlog()
    ]);

    const keywords = title
      ? rankKeywords(title, allKeywords).slice(0, MAX_RESULTS)
      : allKeywords.slice(0, MAX_RESULTS);

    const aeoPrompts = title
      ? rankAEOPrompts(title, allPrompts).slice(0, MAX_RESULTS)
      : allPrompts.slice(0, MAX_RESULTS);

    return NextResponse.json({ keywords, aeoPrompts } satisfies RecommendationsResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load recommendations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
