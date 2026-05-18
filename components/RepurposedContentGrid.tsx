"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { EditableCell } from "@/components/EditableCell";
import { EmptyState } from "@/components/EmptyState";
import { NewRecordModal } from "@/components/NewRecordModal";
import { useEditableRecord } from "@/hooks/useEditableRecord";
import { getCreateDefinitions, mergeSchemaChoices, TableName } from "@/lib/editing";
import { AirtableRecord, AirtableTableSchema, RepurposedContentFields } from "@/lib/types";
import { asText, formatDate } from "@/lib/utils";

type ContentRecord = AirtableRecord<RepurposedContentFields>;
const PAGE_SIZE = 25;
const visibilityOptions = ["Instagram", "Facebook", "Reel", "Email", "Ad", "Hashtags"] as const;

export function RepurposedContentGrid({ records: initialRecords, schema }: { records: ContentRecord[]; schema: AirtableTableSchema | null }) {
  const tableName: TableName = "Repurposed Content";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [visibleSections, setVisibleSections] = useState<string[]>([...visibilityOptions]);
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const { records, updateField, createRecord, getFieldStatus } = useEditableRecord<ContentRecord>(initialRecords, tableName);
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

  function toggleVisibility(option: string) {
    setVisibleSections((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
  }

  const sectionMap = {
    Instagram: (record: ContentRecord) => record.fields["Instagram Caption"] || "",
    Facebook: (record: ContentRecord) => record.fields["Facebook Post"] || "",
    Reel: (record: ContentRecord) => record.fields["Reel Script"] || record.fields.Reel || "",
    Email: (record: ContentRecord) => record.fields["Email Snippet"] || "",
    Ad: (record: ContentRecord) => record.fields["Ad Copy"] || "",
    Hashtags: (record: ContentRecord) => asText(record.fields.Hashtags)
  };

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
            placeholder="Search captions, email snippets, hashtags..."
            className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowCreate(true)} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
              + New Record
            </button>
            {visibilityOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleVisibility(option)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  visibleSections.includes(option)
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No repurposed content matched" />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {paginated.map((record) => {
              const tabs = visibilityOptions.filter((option) => visibleSections.includes(option));
              const activeTab = activeTabs[record.id] ?? tabs[0] ?? "Instagram";
              const content = sectionMap[activeTab as keyof typeof sectionMap]?.(record) || "";

              return (
                <div key={record.id} className="card p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{record.fields.Id || record.id}</h3>
                        <EditableCell
                          definition={definitionMap["Content Status"]}
                          value={record.fields["Content Status"]}
                          status={getFieldStatus(record.id, "Content Status")}
                          displayContext="contentStatus"
                          onSave={(value) => updateField(record.id, "Content Status", value)}
                        />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Last modified {formatDate(record.fields["Last Modified"])}</p>
                    </div>
                    <CopyButton value={content} />
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTabs((current) => ({ ...current, [record.id]: tab }))}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                          activeTab === tab ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <EditableCell
                      definition={
                        definitionMap[
                          activeTab === "Instagram"
                            ? "Instagram Caption"
                            : activeTab === "Facebook"
                              ? "Facebook Post"
                              : activeTab === "Reel"
                                ? "Reel Script"
                                : activeTab === "Email"
                                  ? "Email Snippet"
                                  : activeTab === "Ad"
                                    ? "Ad Copy"
                                    : "Hashtags"
                        ]
                      }
                      value={activeTab === "Hashtags" ? (Array.isArray(record.fields.Hashtags) ? record.fields.Hashtags : []) : content}
                      status={getFieldStatus(
                        record.id,
                        activeTab === "Instagram"
                          ? "Instagram Caption"
                          : activeTab === "Facebook"
                            ? "Facebook Post"
                            : activeTab === "Reel"
                              ? "Reel Script"
                              : activeTab === "Email"
                                ? "Email Snippet"
                                : activeTab === "Ad"
                                  ? "Ad Copy"
                                  : "Hashtags"
                      )}
                      onSave={(value) =>
                        updateField(
                          record.id,
                          activeTab === "Instagram"
                            ? "Instagram Caption"
                            : activeTab === "Facebook"
                              ? "Facebook Post"
                              : activeTab === "Reel"
                                ? "Reel Script"
                                : activeTab === "Email"
                                  ? "Email Snippet"
                                  : activeTab === "Ad"
                                    ? "Ad Copy"
                                    : "Hashtags",
                          value
                        )
                      }
                    />
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
            title="New Repurposed Content Record"
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
