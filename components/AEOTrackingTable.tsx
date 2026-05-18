"use client";

import { useMemo, useState } from "react";
import { DataColumn, DataTable } from "@/components/DataTable";
import { EditableCell } from "@/components/EditableCell";
import { NewRecordModal } from "@/components/NewRecordModal";
import { useEditableRecord } from "@/hooks/useEditableRecord";
import { getCreateDefinitions, mergeSchemaChoices, TableName } from "@/lib/editing";
import { AirtableRecord, AEOTrackingFields, AirtableTableSchema } from "@/lib/types";
import { asText } from "@/lib/utils";

type AEORecord = AirtableRecord<AEOTrackingFields>;
export function AEOTrackingTable({ records: initialRecords, schema }: { records: AEORecord[]; schema: AirtableTableSchema | null }) {
  const tableName: TableName = "AEO Tracking";
  const [showCreate, setShowCreate] = useState(false);
  const { records, updateField, createRecord, getFieldStatus } = useEditableRecord<AEORecord>(initialRecords, tableName);
  const definitions = useMemo(() => mergeSchemaChoices(tableName, schema), [schema]);
  const definitionMap = useMemo(() => Object.fromEntries(definitions.map((field) => [field.field, field])), [definitions]);

  const columns: Array<DataColumn<AEORecord>> = [
    {
      id: "queryPrompt",
      label: "Query Prompt",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Query Prompt"]}
          value={row.fields["Query Prompt"]}
          status={getFieldStatus(row.id, "Query Prompt")}
          onSave={(value) => updateField(row.id, "Query Prompt", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Query Prompt"])
    },
    {
      id: "platform",
      label: "Platform",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Platform"]}
          value={row.fields.Platform}
          status={getFieldStatus(row.id, "Platform")}
          displayContext="platform"
          onSave={(value) => updateField(row.id, "Platform", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields.Platform)
    },
    {
      id: "productMentioned",
      label: "Product Mentioned",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Product Mentioned"]}
          value={row.fields["Product Mentioned"]}
          status={getFieldStatus(row.id, "Product Mentioned")}
          onSave={(value) => updateField(row.id, "Product Mentioned", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Product Mentioned"])
    },
    {
      id: "rankingPosition",
      label: "Ranking Position",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Ranking Position"]}
          value={row.fields["Ranking Position"]}
          status={getFieldStatus(row.id, "Ranking Position")}
          onSave={(value) => updateField(row.id, "Ranking Position", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Ranking Position"])
    },
    {
      id: "competitorMentioned",
      label: "Competitor Mentioned",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Competitor Mentioned"]}
          value={row.fields["Competitor Mentioned"]}
          status={getFieldStatus(row.id, "Competitor Mentioned")}
          onSave={(value) => updateField(row.id, "Competitor Mentioned", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Competitor Mentioned"])
    },
    {
      id: "status",
      label: "Status",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Status"]}
          value={row.fields.Status}
          status={getFieldStatus(row.id, "Status")}
          displayContext="aeoStatus"
          onSave={(value) => updateField(row.id, "Status", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields.Status)
    },
    {
      id: "testDate",
      label: "Test Date",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Test Date"]}
          value={row.fields["Test Date"]}
          status={getFieldStatus(row.id, "Test Date")}
          onSave={(value) => updateField(row.id, "Test Date", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Test Date"])
    },
    {
      id: "summary",
      label: "AI Response Summary",
      render: (row) => (
        <EditableCell
          definition={definitionMap["AI Response Summary"]}
          value={row.fields["AI Response Summary"]}
          status={getFieldStatus(row.id, "AI Response Summary")}
          onSave={(value) => updateField(row.id, "AI Response Summary", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["AI Response Summary"])
    }
  ];

  return (
    <>
      <DataTable
        title="AEO Tracking"
        rows={records}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search prompts, platforms, status..."
        toolbar={<button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">+ New Record</button>}
      />
      <NewRecordModal
        open={showCreate}
        title="New AEO Tracking Record"
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
