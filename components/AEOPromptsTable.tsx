"use client";

import { useMemo, useState } from "react";
import { DataColumn, DataTable } from "@/components/DataTable";
import { EditableCell } from "@/components/EditableCell";
import { NewRecordModal } from "@/components/NewRecordModal";
import { useEditableRecord } from "@/hooks/useEditableRecord";
import { getCreateDefinitions, mergeSchemaChoices, TableName } from "@/lib/editing";
import { AirtableRecord, AEOPromptOpportunityFields, AirtableTableSchema } from "@/lib/types";
import { asText } from "@/lib/utils";

type PromptRecord = AirtableRecord<AEOPromptOpportunityFields>;

export function AEOPromptsTable({ records: initialRecords, schema }: { records: PromptRecord[]; schema: AirtableTableSchema | null }) {
  const tableName: TableName = "AEO Prompt Opportunities";
  const [showCreate, setShowCreate] = useState(false);
  const { records, updateField, createRecord, getFieldStatus } = useEditableRecord<PromptRecord>(initialRecords, tableName);
  const definitions = useMemo(() => mergeSchemaChoices(tableName, schema), [schema]);
  const definitionMap = useMemo(() => Object.fromEntries(definitions.map((field) => [field.field, field])), [definitions]);

  const columns: Array<DataColumn<PromptRecord>> = [
    {
      id: "prompt",
      label: "Prompt",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Prompt"]}
          value={row.fields.Prompt}
          status={getFieldStatus(row.id, "Prompt")}
          onSave={(value) => updateField(row.id, "Prompt", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields.Prompt),
      className: "w-1/2 min-w-[320px] text-center"
    },
    {
      id: "contentType",
      label: "Suggested Content Type",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Suggested Content Type"]}
          value={row.fields["Suggested Content Type"]}
          status={getFieldStatus(row.id, "Suggested Content Type")}
          onSave={(value) => updateField(row.id, "Suggested Content Type", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Suggested Content Type"]),
      className: "w-1/2 min-w-[240px] text-center"
    }
  ];

  return (
    <>
      <DataTable
        title="AEO Prompt"
        rows={records}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search prompts..."
        showColumnToggle={false}
        toolbar={
          <button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
            + New Prompt
          </button>
        }
      />
      <NewRecordModal
        open={showCreate}
        title="New AEO Prompt Opportunity"
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
