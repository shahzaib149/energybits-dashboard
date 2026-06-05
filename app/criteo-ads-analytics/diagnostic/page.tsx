import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { mapDailyRecord, mapOverallRecord } from "@/lib/criteo-ads/map";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { resolveBaseId } from "@/lib/airtable/meta/resolve-base";
import { tableRecordsPath } from "@/lib/airtable/endpoints";

export const dynamic = "force-dynamic";

type RawRecord = { id: string; createdTime: string; fields: Record<string, unknown> };

async function fetchRaw(
  baseId: string,
  tableName: string,
  sortField: string,
  filterFormula?: string,
  limit = 200
): Promise<RawRecord[]> {
  const apiKey = getAirtableApiKey();
  const url = new URL(tableRecordsPath(baseId, tableName));
  url.searchParams.set("maxRecords", String(limit));
  url.searchParams.set("sort[0][field]", sortField);
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

function fmt(n: number, dp = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export default async function CriteoDiagnosticPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const user = await getServerUser();
  if (!user || !permissions.canViewAuditLog(user.role)) redirect("/");

  const from = searchParams.from ?? "";
  const to = searchParams.to ?? "";
  const { criteo: CRITEO } = AIRTABLE_BASES;

  const baseId = await resolveBaseId(CRITEO.name);

  const dailyFilter =
    from && to ? `AND(NOT({Day} = ""), {Day} >= "${from}", {Day} <= "${to}")` : 'NOT({Day} = "")';

  const [rawDaily, rawOverall] = await Promise.all([
    fetchRaw(baseId, CRITEO.tables.daily, "Day", dailyFilter).catch((e: Error) => {
      console.error(e);
      return [] as RawRecord[];
    }),
    fetchRaw(baseId, CRITEO.tables.overall, "id", undefined, 5).catch((e: Error) => {
      console.error(e);
      return [] as RawRecord[];
    })
  ]);

  // Field names
  const dailyFields = [...new Set(rawDaily.flatMap((r) => Object.keys(r.fields)))].sort();
  const overallFields = [...new Set(rawOverall.flatMap((r) => Object.keys(r.fields)))].sort();

  // Sum all numeric fields in daily
  const dailyNumericTotals: Record<string, number> = {};
  for (const r of rawDaily) {
    for (const [k, v] of Object.entries(r.fields)) {
      const n = asNumber(v);
      if (n !== 0) dailyNumericTotals[k] = (dailyNumericTotals[k] ?? 0) + n;
    }
  }

  // Mapped totals
  const mappedDailyRows = rawDaily.map((r) => mapDailyRecord(r));
  const mappedSpend = mappedDailyRows.reduce((s, r) => s + r.advertiserCost, 0);
  const mappedClicks = mappedDailyRows.reduce((s, r) => s + r.clicks, 0);
  const mappedDisplays = mappedDailyRows.reduce((s, r) => s + r.displays, 0);
  const mappedRevenue = mappedDailyRows.reduce((s, r) => s + r.revenueGeneratedAllClientAttribution, 0);
  const mappedSales = mappedDailyRows.reduce((s, r) => s + r.salesAllClientAttribution, 0);

  // CTR check — most important
  const ctrValues = rawDaily.slice(0, 20).map((r) => ({
    id: r.id,
    rawCtrField: r.fields["CTR (calculated)"],
    rawCtrType: typeof r.fields["CTR (calculated)"],
    mappedCtrPct: mapDailyRecord(r).ctrPct,
    derivedCtrPct:
      asNumber(r.fields.Displays) > 0
        ? ((asNumber(r.fields.Clicks) / asNumber(r.fields.Displays)) * 100).toFixed(4)
        : "n/a"
  }));

  const sample = rawDaily.slice(0, 5);

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-8 p-6 font-mono text-xs">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Criteo Analytics — Raw Data Diagnostic</h1>
        <p className="mt-1 text-textSecondary">
          Admin only · Unprocessed Airtable values for full verification
        </p>
        <form method="GET" className="mt-4 flex gap-3">
          <label className="flex flex-col gap-1 text-textMuted">
            From
            <input name="from" type="date" defaultValue={from}
              className="rounded border border-border bg-surface px-2 py-1 text-textPrimary" />
          </label>
          <label className="flex flex-col gap-1 text-textMuted">
            To
            <input name="to" type="date" defaultValue={to}
              className="rounded border border-border bg-surface px-2 py-1 text-textPrimary" />
          </label>
          <button type="submit" className="mt-5 rounded bg-brand px-4 py-1.5 text-sm font-medium text-white">
            Filter
          </button>
        </form>
        <p className="mt-2 text-amber-400">
          {from && to
            ? `Filter: ${from} → ${to} · ${rawDaily.length} daily rows`
            : `No date filter — showing last 200 rows. Enter dates to filter.`}
        </p>
      </div>

      {/* ── Criteo Daily Analytics ── */}
      <section className="space-y-6">
        <h2 className="text-base font-bold text-orange-400">
          Criteo Daily Analytics ({rawDaily.length} rows)
        </h2>

        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">All Airtable field names</h3>
          <div className="flex flex-wrap gap-2">
            {dailyFields.map((f) => (
              <span key={f} className="rounded bg-surfaceElevated px-2 py-0.5 text-textSecondary">{f}</span>
            ))}
          </div>
        </div>

        {/* Spend / Revenue totals comparison */}
        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">
            Key metric totals — mapper vs raw Airtable fields
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-textMuted">
                <th className="py-1 pr-4">Metric (from mapper)</th>
                <th className="py-1 pr-4">Mapper Total</th>
                <th className="py-1 pr-4">Reads field</th>
                <th className="py-1">Raw field total</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Spend (advertiserCost)", value: mappedSpend, field: "AdvertiserCost" },
                { label: "Clicks", value: mappedClicks, field: "Clicks" },
                { label: "Displays (impressions)", value: mappedDisplays, field: "Displays" },
                { label: "Revenue", value: mappedRevenue, field: "RevenueGeneratedAllClientAttribution" },
                { label: "Sales", value: mappedSales, field: "SalesAllClientAttribution" }
              ].map(({ label, value, field }) => {
                const rawTotal = dailyNumericTotals[field] ?? 0;
                const match = Math.abs(value - rawTotal) < 0.01;
                return (
                  <tr key={label} className={`border-b border-border ${match ? "bg-brand/5" : "bg-red-500/10"}`}>
                    <td className="py-1 pr-4 font-medium text-textPrimary">{label}</td>
                    <td className="py-1 pr-4 tabular-nums text-brand">{fmt(value)}</td>
                    <td className="py-1 pr-4 text-textMuted">{field}</td>
                    <td className="py-1 tabular-nums text-textPrimary">
                      {fmt(rawTotal)}
                      {!match ? " ⚠ MISMATCH" : " ✓"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* All raw numeric field totals */}
        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">All numeric field totals (raw)</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-textMuted">
                <th className="py-1 pr-4">Airtable field name</th>
                <th className="py-1">Sum across all rows</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailyNumericTotals)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .map(([field, total]) => (
                  <tr key={field} className="border-b border-border hover:bg-surfaceElevated">
                    <td className="py-1 pr-4 text-textSecondary">{field}</td>
                    <td className="py-1 tabular-nums text-textPrimary">{fmt(total)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* CTR conversion audit */}
        <div>
          <h3 className="mb-2 font-semibold text-red-400">
            CTR conversion audit (first 20 rows) — check if mapper is 100× off
          </h3>
          <p className="mb-2 text-textMuted">
            "Derived CTR" = (Clicks / Displays) × 100. If this matches "Mapped ctrPct", the conversion is correct.
            If "Mapped ctrPct" is 100× higher than "Derived CTR", the raw field stores a percentage but code multiplies again.
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-textMuted">
                <th className="py-1 pr-4">Row ID</th>
                <th className="py-1 pr-4">Raw CTR field</th>
                <th className="py-1 pr-4">Type</th>
                <th className="py-1 pr-4">Mapped ctrPct</th>
                <th className="py-1">Derived (clicks/displays×100)</th>
              </tr>
            </thead>
            <tbody>
              {ctrValues.map((row) => {
                const rawVal = Number(row.rawCtrField ?? 0);
                const mapped = Number(row.mappedCtrPct ?? 0);
                const derived = Number(row.derivedCtrPct ?? 0);
                const suspicious = derived > 0 && Math.abs(mapped - derived) / derived > 0.5;
                return (
                  <tr key={row.id} className={`border-b border-border ${suspicious ? "bg-red-500/10" : ""}`}>
                    <td className="py-1 pr-4 text-textMuted">{row.id.slice(0, 12)}…</td>
                    <td className="py-1 pr-4 tabular-nums text-textPrimary">{rawVal}</td>
                    <td className="py-1 pr-4 text-textMuted">{row.rawCtrType}</td>
                    <td className={`py-1 pr-4 tabular-nums ${suspicious ? "text-red-400 font-bold" : "text-textPrimary"}`}>
                      {fmt(mapped, 4)}%
                    </td>
                    <td className="py-1 tabular-nums text-brand">{row.derivedCtrPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sample raw vs mapped */}
        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">Sample rows (first 5) — raw vs mapped</h3>
          <div className="space-y-4">
            {sample.map((r) => {
              const mapped = mapDailyRecord(r);
              return (
                <div key={r.id} className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-textMuted">{r.id} · Day: {String(r.fields.Day ?? "?")}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 font-semibold text-amber-400">Raw Airtable</p>
                      <pre className="overflow-auto rounded bg-surfaceElevated p-2 text-[10px] text-textSecondary">
                        {JSON.stringify(r.fields, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-brand">Mapped row (dashboard uses)</p>
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

      {/* ── Criteo Overall Analytics ── */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-orange-400">
          Criteo Overall Analytics ({rawOverall.length} rows) — ALL-TIME, not date-filtered
        </h2>
        <div>
          <h3 className="mb-2 font-semibold text-textPrimary">Field names</h3>
          <div className="flex flex-wrap gap-2">
            {overallFields.map((f) => (
              <span key={f} className="rounded bg-surfaceElevated px-2 py-0.5 text-textSecondary">{f}</span>
            ))}
          </div>
        </div>
        {rawOverall.map((r) => {
          const mapped = mapOverallRecord(r);
          return (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 font-semibold text-amber-400">Raw Airtable</p>
                  <pre className="overflow-auto rounded bg-surfaceElevated p-2 text-[10px] text-textSecondary">
                    {JSON.stringify(r.fields, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-brand">Mapped overall row</p>
                  <pre className="overflow-auto rounded bg-surfaceElevated p-2 text-[10px] text-textSecondary">
                    {JSON.stringify(mapped, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
