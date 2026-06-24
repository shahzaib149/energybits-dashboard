import { NextResponse } from "next/server";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = getAirtableApiKey();
    const baseId = await resolveBaseId(AIRTABLE_BASES.googleAds.name);

    // List all tables in the Google Ads base
    const tablesRes = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store"
    });
    if (!tablesRes.ok) {
      return NextResponse.json({ error: `Tables list ${tablesRes.status}: ${await tablesRes.text()}` }, { status: tablesRes.status });
    }
    const tablesData = (await tablesRes.json()) as { tables: Array<{ id: string; name: string; fields: Array<{ name: string; type: string }> }> };
    const tableNames = tablesData.tables.map(t => t.name);

    // Find any table with "preview" in the name (case-insensitive)
    const previewTable = tablesData.tables.find(t => t.name.toLowerCase().includes("preview"));

    let previewSample = null;
    if (previewTable) {
      const sampleRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(previewTable.name)}?maxRecords=3`,
        { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" }
      );
      if (sampleRes.ok) {
        const sampleData = (await sampleRes.json()) as { records: Array<{ id: string; fields: Record<string, unknown> }> };
        previewSample = sampleData.records.map(r => ({ id: r.id, fields: r.fields }));
      }
    }

    // Also fetch a sample from the creatives table to see what adId values look like
    const creativeSampleRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(AIRTABLE_BASES.googleAds.tables.creatives)}?maxRecords=5&fields[]=Ad+ID&fields[]=Ad+Name`,
      { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" }
    );
    let creativeSample = null;
    if (creativeSampleRes.ok) {
      const d = (await creativeSampleRes.json()) as { records: Array<{ id: string; fields: Record<string, unknown> }> };
      creativeSample = d.records.map(r => ({ airtableId: r.id, "Ad ID": r.fields["Ad ID"], "Ad Name": r.fields["Ad Name"] }));
    }

    return NextResponse.json({
      baseId,
      allTables: tableNames,
      registeredPreviewTableName: AIRTABLE_BASES.googleAds.tables.adPreview,
      previewTableFound: previewTable ? previewTable.name : null,
      previewTableFields: previewTable?.fields.map(f => ({ name: f.name, type: f.type })) ?? [],
      previewSample,
      creativeSample_adIds: creativeSample
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
