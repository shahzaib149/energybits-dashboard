"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { EditableCell } from "@/components/EditableCell";
import { EmptyState } from "@/components/EmptyState";
import { NewRecordModal } from "@/components/NewRecordModal";
import { useEditableRecord } from "@/hooks/useEditableRecord";
import { getCreateDefinitions, mergeSchemaChoices, TableName } from "@/lib/editing";
import { AirtableRecord, AirtableTableSchema, MonthlyReportsFields } from "@/lib/types";
import { asText, formatCompactNumber, formatNumber } from "@/lib/utils";

type ReportRecord = AirtableRecord<MonthlyReportsFields>;
const PAGE_SIZE = 25;

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-950 px-3 py-2 text-white">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SparklineRow({ metrics }: { metrics: number[] }) {
  const max = Math.max(1, ...metrics);
  return (
    <div className="grid h-16 grid-cols-4 items-end gap-2 rounded-xl bg-slate-50 p-3">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-full bg-gradient-to-t from-cyan-600 to-slate-900"
          style={{ height: `${Math.max((metric / max) * 100, 18)}%` }}
        />
      ))}
    </div>
  );
}

export function MonthlyReportsCards({ records: initialRecords, schema }: { records: ReportRecord[]; schema: AirtableTableSchema | null }) {
  const tableName: TableName = "Monthly Reports";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openSections, setOpenSections] = useState<Record<string, string[]>>({});
  const [visibleSections, setVisibleSections] = useState<string[]>([
    "SEO Summary",
    "AEO Summary",
    "GEO Summary",
    "Recommendations"
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const { records, updateField, createRecord, getFieldStatus } = useEditableRecord<ReportRecord>(initialRecords, tableName);
  const definitions = useMemo(() => mergeSchemaChoices(tableName, schema), [schema]);
  const definitionMap = useMemo(() => Object.fromEntries(definitions.map((field) => [field.field, field])), [definitions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return records;
    }

    return records.filter((record) =>
      Object.values(record.fields).some((value) => asText(value).toLowerCase().includes(query))
    );
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSectionVisibility(section: string) {
    setVisibleSections((current) =>
      current.includes(section) ? current.filter((item) => item !== section) : [...current, section]
    );
  }

  function isOpen(recordId: string, section: string) {
    return openSections[recordId]?.includes(section) ?? false;
  }

  function toggleOpen(recordId: string, section: string) {
    setOpenSections((current) => {
      const active = current[recordId] ?? [];
      return {
        ...current,
        [recordId]: active.includes(section) ? active.filter((item) => item !== section) : [...active, section]
      };
    });
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search report summaries, recommendations, metrics..."
            className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowCreate(true)} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
              + New Record
            </button>
            {["SEO Summary", "AEO Summary", "GEO Summary", "Recommendations"].map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => toggleSectionVisibility(section)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  visibleSections.includes(section)
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No monthly reports matched" />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {paginated.map((record) => {
              const metrics = [
                record.fields["Total Blogs Published"] ?? 0,
                record.fields["Total Keywords Ranked"] ?? 0,
                record.fields["Organic Traffic"] ?? 0,
                record.fields["AI Mentions"] ?? 0
              ];

              return (
                <div key={record.id} className="card p-5">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Monthly Report</p>
                      <div className="mt-1 max-w-sm">
                        <EditableCell
                          definition={definitionMap["Report Month"]}
                          value={record.fields["Report Month"]}
                          status={getFieldStatus(record.id, "Report Month")}
                          onSave={(value) => updateField(record.id, "Report Month", value)}
                        />
                      </div>
                    </div>
                    {record.fields["PDF Report URL"] ? (
                      <a
                        href={record.fields["PDF Report URL"]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      >
                        <FileText className="h-4 w-4" />
                        PDF Report
                      </a>
                    ) : null}
                  </div>

                  <SparklineRow metrics={metrics} />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <MetricPill label="Blogs" value={formatNumber(record.fields["Total Blogs Published"])} />
                      <EditableCell definition={definitionMap["Total Blogs Published"]} value={record.fields["Total Blogs Published"]} status={getFieldStatus(record.id, "Total Blogs Published")} onSave={(value) => updateField(record.id, "Total Blogs Published", value)} />
                    </div>
                    <div>
                      <MetricPill label="Keywords" value={formatNumber(record.fields["Total Keywords Ranked"])} />
                      <EditableCell definition={definitionMap["Total Keywords Ranked"]} value={record.fields["Total Keywords Ranked"]} status={getFieldStatus(record.id, "Total Keywords Ranked")} onSave={(value) => updateField(record.id, "Total Keywords Ranked", value)} />
                    </div>
                    <div>
                      <MetricPill label="Traffic" value={formatCompactNumber(record.fields["Organic Traffic"])} />
                      <EditableCell definition={definitionMap["Organic Traffic"]} value={record.fields["Organic Traffic"]} status={getFieldStatus(record.id, "Organic Traffic")} onSave={(value) => updateField(record.id, "Organic Traffic", value)} />
                    </div>
                    <div>
                      <MetricPill label="AI Mentions" value={formatNumber(record.fields["AI Mentions"])} />
                      <EditableCell definition={definitionMap["AI Mentions"]} value={record.fields["AI Mentions"]} status={getFieldStatus(record.id, "AI Mentions")} onSave={(value) => updateField(record.id, "AI Mentions", value)} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {visibleSections.map((section) => {
                      const content = asText(record.fields[section as keyof MonthlyReportsFields]);

                      return (
                        <div key={section} className="rounded-xl border border-slate-100 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => toggleOpen(record.id, section)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <span className="text-sm font-semibold text-slate-900">{section}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-500 transition ${isOpen(record.id, section) ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isOpen(record.id, section) ? (
                            <div className="border-t border-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
                              <EditableCell
                                definition={definitionMap[section]}
                                value={content}
                                status={getFieldStatus(record.id, section)}
                                onSave={(value) => updateField(record.id, section, value)}
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <NewRecordModal
            open={showCreate}
            title="New Monthly Report"
            fields={getCreateDefinitions(tableName, definitions)}
            onClose={() => setShowCreate(false)}
            onSubmit={async (values) => {
              await createRecord(values as Record<string, any>);
              setShowCreate(false);
            }}
          />
        </>
      )}
    </div>
  );
}
