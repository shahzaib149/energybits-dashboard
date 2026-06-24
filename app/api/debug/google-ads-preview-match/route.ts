import { NextResponse } from "next/server";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adName = searchParams.get("name") ?? "";

    const apiKey = getAirtableApiKey();
    const baseId = await resolveBaseId(AIRTABLE_BASES.googleAds.name);

    // 1. Get the Ad ID for this ad from the creatives table
    const creativesUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(AIRTABLE_BASES.googleAds.tables.creatives)}?filterByFormula=${encodeURIComponent(`{Ad Name}="${adName}"`)}&maxRecords=1&fields[]=Ad+ID&fields[]=Ad+Name`;
    const creativesRes = await fetch(creativesUrl, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
    const creativesData = creativesRes.ok ? (await creativesRes.json()) as { records: Array<{ fields: Record<string, unknown> }> } : null;
    const adId = creativesData?.records[0]?.fields["Ad ID"] ?? null;

    // 2. Get ALL records from the preview table
    const previewUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(AIRTABLE_BASES.googleAds.tables.adPreview)}?fields[]=Ad+ID&fields[]=Ad+Name&fields[]=Ad+Type&fields[]=Youtube+video+Id&fields[]=Image+URL`;
    const previewRes = await fetch(previewUrl, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
    const previewData = previewRes.ok ? (await previewRes.json()) as { records: Array<{ id: string; fields: Record<string, unknown> }> } : null;
    const allPreviewIds = previewData?.records.map(r => ({
      id: r.id,
      adId: r.fields["Ad ID"],
      adName: r.fields["Ad Name"],
      adType: r.fields["Ad Type"],
      hasYoutube: !!r.fields["Youtube video Id"],
      hasImage: !!r.fields["Image URL"],
      youtubeId: r.fields["Youtube video Id"],
      imageUrl: r.fields["Image URL"],
    })) ?? [];

    const matched = allPreviewIds.find(r => r.adId === adId || r.adName === adName);

    return NextResponse.json({
      searchedAdName: adName,
      adIdFromCreatives: adId,
      totalPreviewRecords: allPreviewIds.length,
      matched: matched ?? null,
      allPreviewRecords: allPreviewIds,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
