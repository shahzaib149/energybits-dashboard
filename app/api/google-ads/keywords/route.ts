import { NextResponse } from "next/server";
import { googleAds } from "@/lib/google-ads/client";

export const revalidate = 300;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const records = await googleAds.getKeywords(limit);
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ error: "Failed to fetch keyword data" }, { status: 500 });
  }
}
