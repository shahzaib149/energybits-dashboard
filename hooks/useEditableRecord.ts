"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AirtableRecord, AirtableValue } from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "success" | "error";

type AnyFields = Record<string, AirtableValue>;
type AnyRecord = AirtableRecord<AnyFields>;

export function useEditableRecord<T extends AnyRecord>(initialRecords: T[], tableId: string) {
  const [records, setRecords] = useState<T[]>(initialRecords);
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});

  function setFieldStatus(recordId: string, fieldName: string, status: SaveStatus) {
    setStatuses((current) => ({ ...current, [`${recordId}:${fieldName}`]: status }));
  }

  function getFieldStatus(recordId: string, fieldName: string): SaveStatus {
    return statuses[`${recordId}:${fieldName}`] ?? "idle";
  }

  async function updateField(recordId: string, fieldName: string, newValue: AirtableValue) {
    const previousRecords = records;
    setFieldStatus(recordId, fieldName, "saving");

    setRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? {
              ...record,
              fields: {
                ...record.fields,
                [fieldName]: newValue
              }
            }
          : record
      ) as T[]
    );

    try {
      const response = await fetch("/api/airtable/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, recordId, fields: { [fieldName]: newValue } })
      });

      if (!response.ok) {
        setRecords(previousRecords);
        setFieldStatus(recordId, fieldName, "error");
        toast.error("✗ Failed to save — change reverted", { duration: 4000 });
        window.setTimeout(() => setFieldStatus(recordId, fieldName, "idle"), 1500);
        return false;
      }

      setFieldStatus(recordId, fieldName, "success");
      toast.success("✓ Saved", { duration: 1500 });
      window.setTimeout(() => setFieldStatus(recordId, fieldName, "idle"), 1500);
      return true;
    } catch {
      setRecords(previousRecords);
      setFieldStatus(recordId, fieldName, "error");
      toast.error("✗ No response from server", { duration: 4000 });
      window.setTimeout(() => setFieldStatus(recordId, fieldName, "idle"), 1500);
      return false;
    }
  }

  async function updateFields(recordId: string, fields: Record<string, AirtableValue>) {
    const previousRecords = records;
    Object.keys(fields).forEach((fieldName) => setFieldStatus(recordId, fieldName, "saving"));

    setRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? {
              ...record,
              fields: {
                ...record.fields,
                ...fields
              }
            }
          : record
      ) as T[]
    );

    try {
      const response = await fetch("/api/airtable/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, recordId, fields })
      });

      if (!response.ok) {
        setRecords(previousRecords);
        Object.keys(fields).forEach((fieldName) => setFieldStatus(recordId, fieldName, "error"));
        toast.error("✗ Failed to save — change reverted", { duration: 4000 });
        window.setTimeout(() => {
          Object.keys(fields).forEach((fieldName) => setFieldStatus(recordId, fieldName, "idle"));
        }, 1500);
        return false;
      }

      Object.keys(fields).forEach((fieldName) => setFieldStatus(recordId, fieldName, "success"));
      toast.success("✓ Saved", { duration: 1500 });
      window.setTimeout(() => {
        Object.keys(fields).forEach((fieldName) => setFieldStatus(recordId, fieldName, "idle"));
      }, 1500);
      return true;
    } catch {
      setRecords(previousRecords);
      Object.keys(fields).forEach((fieldName) => setFieldStatus(recordId, fieldName, "error"));
      toast.error("✗ No response from server", { duration: 4000 });
      window.setTimeout(() => {
        Object.keys(fields).forEach((fieldName) => setFieldStatus(recordId, fieldName, "idle"));
      }, 1500);
      return false;
    }
  }

  async function createRecord(fields: Record<string, AirtableValue>) {
    try {
      const response = await fetch("/api/airtable/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, fields })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to create record";
        toast.error(`✗ ${errorMessage}`, { duration: 6000 });
        return false;
      }

      const createdRecord = (await response.json()) as T;
      setRecords((current) => [createdRecord, ...current]);
      toast.success("✓ Record created successfully", { duration: 1500 });
      return true;
    } catch {
      toast.error("✗ No response from server", { duration: 4000 });
      return false;
    }
  }

  const actions = useMemo(
    () => ({
      setRecords,
      updateField,
      updateFields,
      createRecord,
      getFieldStatus
    }),
    [records, statuses]
  );

  return {
    records,
    statuses,
    ...actions
  };
}
