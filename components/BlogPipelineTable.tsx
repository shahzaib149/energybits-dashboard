"use client";

import { useEffect, useMemo, useState } from "react";
import { DataColumn, DataTable } from "@/components/DataTable";
import { EditableCell } from "@/components/EditableCell";
import { AddBlogTopicModal } from "@/components/blog/AddBlogTopicModal";
import { PreviewButton } from "@/components/PreviewButton";
import { SlideOver } from "@/components/SlideOver";
import { useEditableRecord } from "@/hooks/useEditableRecord";
import { filterBlogPipelineRecords } from "@/lib/blogRecords";
import { mergeSchemaChoices, TableName } from "@/lib/editing";
import { AirtableRecord, AirtableTableSchema, BlogPipelineFields } from "@/lib/types";
import { asText } from "@/lib/utils";

type BlogRecord = AirtableRecord<BlogPipelineFields>;

export function BlogPipelineTable({ records: initialRecords, schema }: { records: BlogRecord[]; schema: AirtableTableSchema | null }) {
  const tableName: TableName = "Blog Pipeline";
  const [selected, setSelected] = useState<BlogRecord | null>(null);
  const [draftFields, setDraftFields] = useState<Record<string, any>>({});
  const [showAddTopic, setShowAddTopic] = useState(false);
  const { records, updateField, updateFields, createRecord, getFieldStatus } = useEditableRecord<BlogRecord>(initialRecords, tableName);
  const visibleRecords = useMemo(() => filterBlogPipelineRecords(records), [records]);
  const definitions = useMemo(() => mergeSchemaChoices(tableName, schema), [schema]);
  const definitionMap = useMemo(() => Object.fromEntries(definitions.map((field) => [field.field, field])), [definitions]);

  useEffect(() => {
    setDraftFields(selected?.fields ?? {});
  }, [selected]);

  const columns: Array<DataColumn<BlogRecord>> = [
    {
      id: "preview",
      label: "Preview",
      render: (row) => <PreviewButton href={`/blog-pipeline/${row.id}/preview`} />,
      getSearchValue: (row) => row.id,
      className: "w-[100px] min-w-[100px] sm:w-[110px] sm:min-w-[110px]"
    },
    {
      id: "title",
      label: "Topic",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Blog Title"]}
          value={row.fields["Blog Title"]}
          status={getFieldStatus(row.id, "Blog Title")}
          onSave={(value) => updateField(row.id, "Blog Title", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Blog Title"])
    }
  ];

  return (
    <>
      <DataTable
        title="Blog Pipeline"
        rows={visibleRecords}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search topics, personas, statuses..."
        showColumnToggle={false}
        onRowClick={setSelected}
        toolbar={
          <button
            type="button"
            onClick={() => setShowAddTopic(true)}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white sm:w-auto"
          >
            + Add a topic
          </button>
        }
      />
      <SlideOver
        open={Boolean(selected)}
        title={selected?.fields["Blog Title"] || "Untitled topic"}
        subtitle={selected?.fields["Blog Status"] || "No status"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  Object.keys(draftFields).some((key) => draftFields[key] !== selected.fields[key])
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {Object.keys(draftFields).some((key) => draftFields[key] !== selected.fields[key])
                  ? "Unsaved changes"
                  : "All changes saved"}
              </span>
            </div>
            {definitions.map((definition) => {
              const key = definition.field;
              const value = draftFields[key];
              const dirty = value !== selected.fields[key];

              return (
                <div key={key} className={`space-y-2 rounded-xl border-l-4 pl-4 ${dirty ? "border-amber-300" : "border-transparent"}`}>
                  <p className="text-sm font-semibold text-slate-900">{key}</p>
                  <EditableCell
                    definition={definitionMap[key]}
                    value={value}
                    status={getFieldStatus(selected.id, key)}
                    displayContext={key === "Blog Status" ? "blogStatus" : key === "Platform Target" ? "platform" : "generic"}
                    onSave={(nextValue) => setDraftFields((current) => ({ ...current, [key]: nextValue }))}
                  />
                </div>
              );
            })}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDraftFields(selected.fields)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={async () => {
                  const dirtyFields = Object.fromEntries(
                    Object.entries(draftFields).filter(([key, value]) => value !== selected.fields[key])
                  );
                  if (Object.keys(dirtyFields).length > 0) {
                    const success = await updateFields(selected.id, dirtyFields);
                    if (success) {
                      setSelected((current) => (current ? { ...current, fields: { ...current.fields, ...dirtyFields } } : current));
                    }
                  }
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Save All Changes
              </button>
            </div>
          </div>
        ) : null}
      </SlideOver>
      <AddBlogTopicModal
        open={showAddTopic}
        onClose={() => setShowAddTopic(false)}
        onSubmit={async (topic) => {
          const success = await createRecord({ "Blog Title": topic });
          if (success) {
            setShowAddTopic(false);
          } else {
            throw new Error("create failed");
          }
        }}
      />
    </>
  );
}
