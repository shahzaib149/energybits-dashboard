import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";
import { tableRecordsPath } from "@/lib/airtable/endpoints";
import { mapMetaAdInsightRecord, mapMetaCampaignRecord } from "@/lib/meta-analytics/map";

export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint — returns raw Airtable field names & values for Meta tables,
 * alongside our mapper's output, so every field mapping can be verified against
 * what Airtable actually returns.
 *
 * Admin-only. GET /api/meta-analytics/diagnostic?table=ads|campaigns&limit=5
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser();
  if (!user || !permissions.canViewAuditLog(user.role)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const tableKey = params.get("table") ?? "ads";
  const limit = Math.min(parseInt(params.get("limit") ?? "5", 10), 50);
  const from = params.get("from");
  const to = params.get("to");

  const { meta: META } = AIRTABLE_BASES;
  const tableName = tableKey === "campaigns" ? META.tables.campaigns : META.tables.adInsights;
  const mapper = tableKey === "campaigns" ? mapMetaCampaignRecord : mapMetaAdInsightRecord;
  const dateField = tableKey === "campaigns" ? "Date Start" : "date_start";

  try {
    const baseId = await resolveBaseId(META.name);
    const apiKey = getAirtableApiKey();

    const url = new URL(tableRecordsPath(baseId, tableName));
    url.searchParams.set("maxRecords", String(limit));
    url.searchParams.set("sort[0][field]", dateField);
    url.searchParams.set("sort[0][direction]", "desc");

    if (from && to) {
      if (tableKey === "campaigns") {
        url.searchParams.set(
          "filterByFormula",
          `AND({Date Start} <= "${to}", OR({Date Stop} = BLANK(), {Date Stop} >= "${from}"))`
        );
      } else {
        url.searchParams.set(
          "filterByFormula",
          `AND({${dateField}} >= "${from}", {${dateField}} <= "${to}")`
        );
      }
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store"
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Airtable error ${res.status}`, detail: text }, { status: res.status });
    }

    const raw = (await res.json()) as {
      records: Array<{ id: string; createdTime: string; fields: Record<string, unknown> }>;
    };

    const records = raw.records;

    // --- Field name inventory: all unique keys across all returned records ---
    const allFieldNames = new Set<string>();
    for (const r of records) {
      Object.keys(r.fields).forEach((k) => allFieldNames.add(k));
    }

    // --- Mapped output for each record ---
    const mappedRecords = records.map((r) => ({
      airtableId: r.id,
      rawFields: r.fields,
      mapped: mapper(r)
    }));

    // --- Spend totals: raw vs mapped ---
    let rawSpendTotal = 0;
    let mappedSpendTotal = 0;
    const spendFieldCandidates: Record<string, number> = {};

    for (const r of records) {
      const mapped = mapper(r) as { spend?: number };
      mappedSpendTotal += mapped.spend ?? 0;

      // Try every field that looks like it could be spend
      for (const [key, val] of Object.entries(r.fields)) {
        if (typeof val === "number") {
          spendFieldCandidates[key] = (spendFieldCandidates[key] ?? 0) + val;
        } else if (typeof val === "string") {
          const cleaned = val.replace(/[$,%\s,]/g, "");
          const n = Number(cleaned);
          if (Number.isFinite(n) && n > 0) {
            spendFieldCandidates[`${key} (string→number)`] =
              (spendFieldCandidates[`${key} (string→number)`] ?? 0) + n;
          }
        }
      }

      // Explicit spend field
      const spendRaw = r.fields["spend"] ?? r.fields["Spend"] ?? r.fields["Amount Spent"];
      if (typeof spendRaw === "number") rawSpendTotal += spendRaw;
      else if (typeof spendRaw === "string") {
        const n = Number(spendRaw.replace(/[$,\s]/g, ""));
        if (Number.isFinite(n)) rawSpendTotal += n;
      }
    }

    return NextResponse.json({
      meta: {
        table: tableName,
        tableKey,
        baseId,
        recordsReturned: records.length,
        limit,
        dateFilter: from && to ? { from, to } : "none"
      },
      fieldNames: Array.from(allFieldNames).sort(),
      spendAudit: {
        mappedSpendTotal: mappedSpendTotal.toFixed(4),
        rawSpendFieldTotal: rawSpendTotal.toFixed(4),
        allNumericFieldTotals: Object.fromEntries(
          Object.entries(spendFieldCandidates)
            .sort(([, a], [, b]) => b - a)
            .map(([k, v]) => [k, v.toFixed(4)])
        )
      },
      records: mappedRecords
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
