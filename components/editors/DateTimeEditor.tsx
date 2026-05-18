"use client";

import { useEffect, useState } from "react";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { formatDate } from "@/lib/utils";

export function DateTimeEditor({
  value,
  disabled,
  status,
  onSave
}: {
  value?: string;
  disabled?: boolean;
  status: SaveStatus;
  onSave: (value: string) => Promise<any> | void;
}) {
  const [datePart, setDatePart] = useState("");
  const [timePart, setTimePart] = useState("");

  useEffect(() => {
    if (!value) {
      setDatePart("");
      setTimePart("");
      return;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    setDatePart(date.toISOString().slice(0, 10));
    setTimePart(date.toISOString().slice(11, 16));
  }, [value]);

  async function commit(nextDate = datePart, nextTime = timePart) {
    if (!nextDate || !nextTime) {
      return;
    }
    await onSave(new Date(`${nextDate}T${nextTime}:00`).toISOString());
  }

  return (
    <SaveIndicator status={status} editable={!disabled}>
      {disabled ? (
        <div className="rounded-lg px-2 py-1.5 text-sm">{formatDate(value)}</div>
      ) : (
        <div className="flex gap-2 rounded-lg px-2 py-1.5">
          <input
            type="date"
            value={datePart}
            onChange={(event) => {
              setDatePart(event.target.value);
              void commit(event.target.value, timePart);
            }}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
          />
          <input
            type="time"
            value={timePart}
            onChange={(event) => {
              setTimePart(event.target.value);
              void commit(datePart, event.target.value);
            }}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
          />
        </div>
      )}
    </SaveIndicator>
  );
}
