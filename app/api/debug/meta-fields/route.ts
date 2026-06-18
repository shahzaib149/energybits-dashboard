import { NextResponse } from "next/server";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const adName = new URL(req.url).searchParams.get("ad") ?? "";
    const apiKey = getAirtableApiKey();
    const baseId = await resolveBaseId(AIRTABLE_BASES.meta.name);
    const tableName = AIRTABLE_BASES.meta.tables.adInsights; // "facebook_ads_insights"

    const filter = adName
      ? `&filterByFormula=SEARCH("${adName.replace(/"/g, "")}", {ad_name})`
      : "";

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1${filter}`;

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
      return NextResponse.json({ message: `No records found${adName ? ` for ad: ${adName}` : ""}` });
    }

    // Show all fields — focus on conversion-related ones
    const conversionKeys = Object.keys(record.fields).filter(k =>
      /purchase|action|convert|lead|roas|value|sale/i.test(k)
    );

    return NextResponse.json({
      adName: record.fields.ad_name ?? record.fields["ad name"],
      adId: record.fields.ad_id ?? record.fields["ad id"],
      allFieldNames: Object.keys(record.fields),
      conversionFields: Object.fromEntries(
        conversionKeys.map(k => [k, record.fields[k]])
      ),
      rawActionsField: record.fields.actions ?? null,
      rawActionValuesField: record.fields.action_values ?? record.fields["action values"] ?? null,
      rawPurchaseRoasField: record.fields.purchase_roas ?? null
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
