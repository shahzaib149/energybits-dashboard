"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";

export function NumberEditor({
  value,
  disabled,
  precision = 0,
  status,
  onSave
}: {
  value?: number;
  disabled?: boolean;
  precision?: number;
  status: SaveStatus;
  onSave: (value: number) => Promise<any> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? "");

  useEffect(() => setDraft(value?.toString() ?? ""), [value]);

  async function commit() {
    setEditing(false);
    if (draft === "") {
      return;
    }

    const parsed = precision === 0 ? Number.parseInt(draft, 10) : Number.parseFloat(draft);
    if (!Number.isNaN(parsed) && parsed !== value) {
      await onSave(parsed);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      void commit();
    }
    if (event.key === "Escape") {
      setDraft(value?.toString() ?? "");
      setEditing(false);
    }
  }

  return (
    <SaveIndicator status={status} editable={!disabled}>
      {editing && !disabled ? (
        <input
          autoFocus
          type="number"
          step={precision === 0 ? "1" : "0.01"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-blue-300 px-2 py-1.5 text-sm outline-none"
        />
      ) : (
        <button type="button" disabled={disabled} onClick={() => setEditing(true)} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm">
          {typeof value === "number" ? value : "—"}
        </button>
      )}
    </SaveIndicator>
  );
}
