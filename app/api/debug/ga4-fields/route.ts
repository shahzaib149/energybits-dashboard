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
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store"
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Airtable ${res.status}: ${await res.text()}` }, { status: res.status });
    }

    const data = (await res.json()) as { records: Array<{ id: string; fields: Record<string, unknown> }> };
    const record = data.records[0];

    if (!record) {
      return NextResponse.json({ message: "No records found in GA4 Page Performance table" });
    }

    return NextResponse.json({
      recordId: record.id,
      fieldNames: Object.keys(record.fields),
      sampleValues: Object.fromEntries(
        Object.entries(record.fields).map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 80) : v])
      )
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
