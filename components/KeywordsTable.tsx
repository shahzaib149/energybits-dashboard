"use client";

import { useMemo, useState } from "react";
import { DataTable, DataColumn } from "@/components/DataTable";
import { EditableCell } from "@/components/EditableCell";
import { NewRecordModal } from "@/components/NewRecordModal";
import { useEditableRecord } from "@/hooks/useEditableRecord";
import { getCreateDefinitions, mergeSchemaChoices, TableName } from "@/lib/editing";
import { AirtableRecord, AirtableTableSchema, KeywordsFields } from "@/lib/types";
import { asText } from "@/lib/utils";

type KeywordRecord = AirtableRecord<KeywordsFields>;

export function KeywordsTable({ records: initialRecords, schema }: { records: KeywordRecord[]; schema: AirtableTableSchema | null }) {
  const tableName: TableName = "Keywords";
  const [showCreate, setShowCreate] = useState(false);
  const { records, updateField, createRecord, getFieldStatus } = useEditableRecord<KeywordRecord>(initialRecords, tableName);
  const definitions = useMemo(() => mergeSchemaChoices(tableName, schema), [schema]);
  const definitionMap = useMemo(() => Object.fromEntries(definitions.map((field) => [field.field, field])), [definitions]);

  const columns: Array<DataColumn<KeywordRecord>> = [
    {
      id: "keyword",
      label: "Keyword",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Keyword"]}
          value={row.fields.Keyword}
          status={getFieldStatus(row.id, "Keyword")}
          onSave={(value) => updateField(row.id, "Keyword", value)}
          theme="dark"
        />
      ),
      getSearchValue: (row) => asText(row.fields.Keyword),
      className: "min-w-[260px] text-left"
    },
    {
      id: "searchVolume",
      label: "Search Volume",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Search Volume"]}
          value={row.fields["Search Volume"]}
          status={getFieldStatus(row.id, "Search Volume")}
          onSave={(value) => updateField(row.id, "Search Volume", value)}
          theme="dark"
        />
      ),
      getSearchValue: (row) => asText(row.fields["Search Volume"]),
      className: "min-w-[180px] text-left tabular-nums"
    }
  ];

  return (
    <>
      <DataTable
        title="Keywords"
        rows={records}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search keywords..."
        showColumnToggle={false}
        variant="dark"
        toolbar={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
          >
            + New Keyword
          </button>
        }
      />
      <NewRecordModal
        open={showCreate}
        title="New Keyword"
        fields={getCreateDefinitions(tableName, definitions)}
        onClose={() => setShowCreate(false)}
        onSubmit={async (values) => {
          await createRecord(values as Record<string, any>);
          setShowCreate(false);
        }}
      />
    </>
  );
}
