import { NextResponse } from "next/server";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = getAirtableApiKey();
    const baseId = await resolveBaseId(AIRTABLE_BASES.seo.name);
    const tableName = AIRTABLE_BASES.seo.tables.ga4PagePerformance;
    // Fetch top 5 records sorted by Sessions desc to see what's actually rendering
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=5&sort%5B0%5D%5Bfield%5D=Sessions&sort%5B0%5D%5Bdirection%5D=desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store"
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Airtable ${res.status}: ${await res.text()}` }, { status: res.status });
    }

    const data = (await res.json()) as { records: Array<{ id: string; fields: Record<string, unknown> }> };
    if (!data.records.length) {
      return NextResponse.json({ message: "No records found in GA4 Page Performance table" });
    }

    return NextResponse.json({
      fieldNames: Object.keys(data.records[0].fields),
      top5BySessionsDesc: data.records.map(r => ({
        id: r.id,
        pagePath: r.fields["Page Path"] ?? null,
        pageTitle: r.fields["Page Title"] ?? null,
        sessions: r.fields["Sessions"] ?? null,
        endDate: r.fields["End Date"] ?? null
      }))
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
