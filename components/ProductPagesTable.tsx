"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { DataColumn, DataTable } from "@/components/DataTable";
import { EditableCell } from "@/components/EditableCell";
import { NewRecordModal } from "@/components/NewRecordModal";
import { useEditableRecord } from "@/hooks/useEditableRecord";
import { getCreateDefinitions, mergeSchemaChoices, TableName } from "@/lib/editing";
import { AirtableRecord, AirtableTableSchema, ProductPagesFields } from "@/lib/types";
import { asText, formatDate } from "@/lib/utils";

type ProductRecord = AirtableRecord<ProductPagesFields>;

function DiffBlock({ title, before, after }: { title: string; before?: string; after?: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">{title} · Existing</p>
        <p className="text-sm leading-6 text-rose-800">{before || "—"}</p>
      </div>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{title} · Improved</p>
        <p className="text-sm leading-6 text-emerald-800">{after || "—"}</p>
      </div>
    </div>
  );
}

export function ProductPagesTable({ records: initialRecords, schema }: { records: ProductRecord[]; schema: AirtableTableSchema | null }) {
  const tableName: TableName = "Product Pages";
  const [selected, setSelected] = useState<ProductRecord | null>(initialRecords[0] ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const { records, updateField, createRecord, getFieldStatus } = useEditableRecord<ProductRecord>(initialRecords, tableName);
  const definitions = useMemo(() => mergeSchemaChoices(tableName, schema), [schema]);
  const definitionMap = useMemo(() => Object.fromEntries(definitions.map((field) => [field.field, field])), [definitions]);

  const columns: Array<DataColumn<ProductRecord>> = [
    {
      id: "productName",
      label: "Product Name",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Product Name"]}
          value={row.fields["Product Name"]}
          status={getFieldStatus(row.id, "Product Name")}
          onSave={(value) => updateField(row.id, "Product Name", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Product Name"])
    },
    {
      id: "productUrl",
      label: "Product URL",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Product URL"]}
          value={row.fields["Product URL"]}
          status={getFieldStatus(row.id, "Product URL")}
          onSave={(value) => updateField(row.id, "Product URL", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Product URL"])
    },
    {
      id: "productCategory",
      label: "Product Category",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Product Category"]}
          value={row.fields["Product Category"]}
          status={getFieldStatus(row.id, "Product Category")}
          onSave={(value) => updateField(row.id, "Product Category", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Product Category"])
    },
    {
      id: "seoStatus",
      label: "SEO Status",
      render: (row) => (
        <EditableCell
          definition={definitionMap["SEO Status"]}
          value={row.fields["SEO Status"]}
          status={getFieldStatus(row.id, "SEO Status")}
          displayContext="seoStatus"
          onSave={(value) => updateField(row.id, "SEO Status", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["SEO Status"])
    },
    {
      id: "existingMetaTitle",
      label: "Existing Meta Title",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Existing Meta Title"]}
          value={row.fields["Existing Meta Title"]}
          status={getFieldStatus(row.id, "Existing Meta Title")}
          onSave={(value) => updateField(row.id, "Existing Meta Title", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Existing Meta Title"])
    },
    {
      id: "improvedMetaTitle",
      label: "Improved Meta Title",
      render: (row) => (
        <EditableCell
          definition={definitionMap["Improved Meta Title"]}
          value={row.fields["Improved Meta Title"]}
          status={getFieldStatus(row.id, "Improved Meta Title")}
          onSave={(value) => updateField(row.id, "Improved Meta Title", value)}
        />
      ),
      getSearchValue: (row) => asText(row.fields["Improved Meta Title"])
    },
    {
      id: "lastModified",
      label: "Last Modified",
      render: (row) => formatDate(row.fields["Last Modified"]),
      getSearchValue: (row) => asText(row.fields["Last Modified"])
    }
  ];

  return (
    <>
      <div className="space-y-4">
        <DataTable
          title="Product Pages"
          rows={records}
          columns={columns}
          getRowId={(row) => row.id}
          searchPlaceholder="Search products, SEO status, category..."
          onRowClick={setSelected}
          toolbar={<button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">+ New Record</button>}
        />
        {selected ? (
          <div className="card p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selected.fields["Product Name"] || "Meta Diff"}</h3>
                <p className="mt-1 text-sm text-slate-500">Side-by-side comparison for titles and descriptions</p>
              </div>
              <Badge value={selected.fields["SEO Status"]} context="seoStatus" />
            </div>
            <div className="space-y-4">
              <DiffBlock
                title="Meta Title"
                before={selected.fields["Existing Meta Title"]}
                after={selected.fields["Improved Meta Title"]}
              />
              <DiffBlock
                title="Meta Description"
                before={selected.fields["Existing Meta Description"]}
                after={selected.fields["Improved Meta Description"]}
              />
            </div>
          </div>
        ) : null}
      </div>
      <NewRecordModal
        open={showCreate}
        title="New Product Page"
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
