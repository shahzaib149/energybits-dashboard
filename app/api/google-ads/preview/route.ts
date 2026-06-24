import { NextResponse } from "next/server";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { mapPreviewRecord } from "@/lib/google-ads/map";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adId   = searchParams.get("adId") ?? "";
    const adName = searchParams.get("adName") ?? "";

    if (!adId && !adName) {
      return NextResponse.json({ preview: null });
    }

    const apiKey  = getAirtableApiKey();
    const baseId  = await resolveBaseId(AIRTABLE_BASES.googleAds.name);
    const table   = AIRTABLE_BASES.googleAds.tables.adPreview; // "Google Ad Preview"

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store"
    });

    if (!res.ok) {
      return NextResponse.json({ preview: null, error: `Airtable ${res.status}` });
    }

    let allRecords: Array<{ id: string; fields: Record<string, unknown> }> = [];
    const data = (await res.json()) as { records: typeof allRecords; offset?: string };
    allRecords = data.records;

    // Paginate if needed
    let offset = data.offset;
    while (offset) {
      const next = await fetch(`${url}?offset=${encodeURIComponent(offset)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store"
      });
      if (!next.ok) break;
      const nextData = (await next.json()) as { records: typeof allRecords; offset?: string };
      allRecords.push(...nextData.records);
      offset = nextData.offset;
    }

    const mapped = allRecords.map(mapPreviewRecord);

    // Match by adId first, then adName
    let match = adId ? mapped.find(r => r.adId.trim() === adId.trim()) : null;
    if (!match && adName) {
      match = mapped.find(r => r.adName.trim().toLowerCase() === adName.trim().toLowerCase()) ?? null;
    }

    return NextResponse.json({ preview: match ?? null, total: mapped.length });
  } catch (err) {
    return NextResponse.json({ preview: null, error: String(err) }, { status: 500 });
  }
}
