import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { mapMetaAdInsightRecord, mapMetaCampaignRecord } from "@/lib/meta-analytics/map";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";
import { tableRecordsPath } from "@/lib/airtable/endpoints";

export const dynamic = "force-dynamic";

type RawRecord = { id: string; createdTime: string; fields: Record<string, unknown> };

async function fetchRaw(
  baseId: string,
  tableName: string,
  dateField: string,
  filterFormula?: string,
  limit = 200
): Promise<RawRecord[]> {
  const apiKey = getAirtableApiKey();
  const url = new URL(tableRecordsPath(baseId, tableName));
  url.searchParams.set("maxRecords", String(limit));
  url.searchParams.set("sort[0][field]", dateField);
  url.searchParams.set("sort[0][direction]", "desc");
  if (filterFormula) url.searchParams.set("filterByFormula", filterFormula);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { records: RawRecord[] };
  return data.records;
}

function asNumber(v: unknown): number {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.replace(/[$,%\s,]/g, "").trim());
    return isFinite(n) ? n : 0;
  }
  return 0;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function MetaDiagnosticPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const user = await getServerUser();
  if (!user || !permissions.canViewAuditLog(user.role)) redirect("/");

  const from = searchParams.from ?? "";
  const to = searchParams.to ?? "";
  const { meta: META } = AIRTABLE_BASES;

  const baseId = await resolveBaseId(META.name);

  // Fetch raw records from both tables
  const adsFilter = from && to ? `AND({date_start} >= "${from}", {date_start} <= "${to}")` : undefined;
  const campsFilter =
    from && to
      ? `AND({Date Start} <= "${to}", OR({Date Stop} = BLANK(), {Date Stop} >= "${from}"))`
      : undefined;

  const [rawAds, rawCampaigns] = await Promise.all([
    fetchRaw(baseId, META.tables.adInsights, "date_start", adsFilter).catch((e: Error) => {
      console.error(e);
      return [] as RawRecord[];
    }),
    fetchRaw(baseId, META.tables.campaigns, "Date Start", campsFilter).catch((e: Error) => {
      console.error(e);
      return [] as RawRecord[];
    })
  ]);

  // --- Field names in each table ---
  const adsFields = [...new Set(rawAds.flatMap((r) => Object.keys(r.fields)))].sort();
  const campFields = [...new Set(rawCampaigns.flatMap((r) => Object.keys(r.fields)))].sort();

  // --- Sum every numeric field in ads ---
  const adsNumericTotals: Record<string, number> = {};
  for (const r of rawAds) {
    for (const [k, v] of Object.entries(r.fields)) {
      const n = asNumber(v);
      if (n !== 0) adsNumericTotals[k] = (adsNumericTotals[k] ?? 0) + n;
    }
  }

  // --- Sum every numeric field in campaigns ---
  const campNumericTotals: Record<string, number> = {};
  for (const r of rawCampaigns) {
    for (const [k, v] of Object.entries(r.fields)) {
      const n = asNumber(v);
      if (n !== 0) campNumericTotals[k] = (campNumericTotals[k] ?? 0) + n;
    }
  }

  // --- Mapped spend vs raw spend ---
  const mappedAdsSpend = rawAds.reduce((s, r) => s + (mapMetaAdInsightRecord(r).spend ?? 0), 0);
  const mappedCampSpend = rawCampaigns.reduce(
    (s, r) => s + (mapMetaCampaignRecord(r).spend ?? 0),
    0
  );

  // --- Sample records (first 5 each) ---
  const adsSample = rawAds.slice(0, 5);
  const campSample = rawCampaigns.slice(0, 5);

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-8 p-6 font-mono text-xs">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Meta Analytics — Raw Data Diagnostic</h1>
        <p className="mt-1 text-textSecondary">
          Admin only · Shows unprocessed Airtable values so every number can be verified
        </p>
        <form method="GET" className="mt-4 flex gap-3">
          <label className="flex flex-col gap-1 text-textMuted">
            From
            <input
              name="from"
              type="date"
              defaultValue={from}
              className="rounded border border-border bg-surface px-2 py-1 text-textPrimary"
            />
          </label>
          <label className="flex flex-col gap-1 text-textMuted">
            To
            <input
              name="to"
              type="date"
              defaultValue={to}
              className="rounded border border-border bg-surface px-2 py-1 text-textPrimary"
            />
          </label>
          <button
            type="submit"
            className="mt-5 rounded bg-brand px-4 py-1.5 text-sm font-medium text-white"
          >
            Filter
          </button>
        </form>
        {from && to ? (
          <p className="mt-2 text-amber-400">
            Filter: {from} → {to} · {rawAds.length} ad insight rows · {rawCampaigns.length} campaign rows
          </p>
        ) : (
          <p className="mt-2 text-amber-400">
            Showing last 200 records per table (no date filter). Enter dates above to filter.
          </p>
        )}
      </div>

      {/* ── facebook_ads_insights ── */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-[#4599FF]">facebook_ads_insights ({rawAds.length} rows)</h2>

        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">All field names in Airtable</h3>
          <div className="flex flex-wrap gap-2">
            {adsFields.map((f) => (
              <span key={f} className="rounded bg-surfaceElevated px-2 py-0.5 text-textSecondary">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">
            Spend check — mapped value vs every numeric field total
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-textMuted">
                <th className="py-1 pr-4">Source</th>
                <th className="py-1 pr-4">Total</th>
                <th className="py-1">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-brand/10">
                <td className="py-1 pr-4 font-semibold text-brand">Our mapper → spend</td>
                <td className="py-1 pr-4 font-semibold text-brand">${fmt(mappedAdsSpend)}</td>
                <td className="py-1 text-textMuted">reads f.spend via asNumber()</td>
              </tr>
              {Object.entries(adsNumericTotals)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .map(([field, total]) => (
                  <tr key={field} className="border-b border-border hover:bg-surfaceElevated">
                    <td className="py-1 pr-4 text-textSecondary">{field}</td>
                    <td className="py-1 pr-4 tabular-nums text-textPrimary">{fmt(total)}</td>
                    <td className="py-1 text-textMuted">
                      {field === "spend" ? "✓ correct field" : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">Sample rows (first 5) — raw vs mapped</h3>
          <div className="space-y-4">
            {adsSample.map((r) => {
              const mapped = mapMetaAdInsightRecord(r);
              return (
                <div key={r.id} className="rounded-lg border border-border p-3">
                  <p className="mb-2 font-semibold text-textMuted">{r.id}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 font-semibold text-amber-400">Raw Airtable fields</p>
                      <pre className="overflow-auto rounded bg-surfaceElevated p-2 text-[10px] text-textSecondary">
                        {JSON.stringify(r.fields, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-brand">Mapped row (what dashboard uses)</p>
                      <pre className="overflow-auto rounded bg-surfaceElevated p-2 text-[10px] text-textSecondary">
                        {JSON.stringify(mapped, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Meta Campaign Analytics ── */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-[#4599FF]">
          Meta Campaign Analytics ({rawCampaigns.length} rows)
        </h2>

        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">All field names in Airtable</h3>
          <div className="flex flex-wrap gap-2">
            {campFields.map((f) => (
              <span key={f} className="rounded bg-surfaceElevated px-2 py-0.5 text-textSecondary">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">Spend check — every numeric field total</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-textMuted">
                <th className="py-1 pr-4">Field</th>
                <th className="py-1 pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-brand/10">
                <td className="py-1 pr-4 font-semibold text-brand">Our mapper → spend</td>
                <td className="py-1 pr-4 font-semibold text-brand">${fmt(mappedCampSpend)}</td>
              </tr>
              {Object.entries(campNumericTotals)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .map(([field, total]) => (
                  <tr key={field} className="border-b border-border hover:bg-surfaceElevated">
                    <td className="py-1 pr-4 text-textSecondary">{field}</td>
                    <td className="py-1 pr-4 tabular-nums text-textPrimary">{fmt(total)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">Sample rows (first 5) — raw vs mapped</h3>
          <div className="space-y-4">
            {campSample.map((r) => {
              const mapped = mapMetaCampaignRecord(r);
              return (
                <div key={r.id} className="rounded-lg border border-border p-3">
                  <p className="mb-2 font-semibold text-textMuted">{r.id}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 font-semibold text-amber-400">Raw Airtable fields</p>
                      <pre className="overflow-auto rounded bg-surfaceElevated p-2 text-[10px] text-textSecondary">
                        {JSON.stringify(r.fields, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-brand">Mapped row (what dashboard uses)</p>
                      <pre className="overflow-auto rounded bg-surfaceElevated p-2 text-[10px] text-textSecondary">
                        {JSON.stringify(mapped, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
