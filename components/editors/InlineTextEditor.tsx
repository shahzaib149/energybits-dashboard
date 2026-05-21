"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";

export function InlineTextEditor({
  value,
  disabled,
  status,
  onSave,
  displayClassName,
  inputClassName
}: {
  value?: string;
  disabled?: boolean;
  status: SaveStatus;
  onSave: (value: string) => Promise<any> | void;
  displayClassName?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => setDraft(value ?? ""), [value]);

  async function commit() {
    setEditing(false);
    if (draft !== (value ?? "")) {
      await onSave(draft);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      void commit();
    }
    if (event.key === "Escape") {
      setDraft(value ?? "");
      setEditing(false);
    }
  }

  return (
    <SaveIndicator status={status} editable={!disabled}>
      {editing && !disabled ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className={inputClassName ?? "w-full rounded-lg border border-blue-300 px-2 py-1.5 text-sm outline-none"}
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setEditing(true)}
          className={displayClassName ?? "block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 disabled:cursor-default"}
        >
          {value || "—"}
        </button>
      )}
    </SaveIndicator>
  );
}
