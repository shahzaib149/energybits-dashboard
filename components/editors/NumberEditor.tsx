"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { SaveIndicator, type EditorTheme } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";

export function NumberEditor({
  value,
  disabled,
  precision = 0,
  status,
  onSave,
  theme = "light"
}: {
  value?: number;
  disabled?: boolean;
  precision?: number;
  status: SaveStatus;
  onSave: (value: number) => Promise<any> | void;
  theme?: EditorTheme;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const isDark = theme === "dark";

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

  const inputClass = isDark
    ? "w-full rounded-lg border border-border bg-surfaceElevated px-2 py-1.5 text-sm text-textPrimary outline-none focus:border-brand/50"
    : "w-full rounded-lg border border-blue-300 px-2 py-1.5 text-sm outline-none";

  const displayClass = isDark
    ? "block w-full rounded-lg px-2 py-1.5 text-left text-sm text-textPrimary"
    : "block w-full rounded-lg px-2 py-1.5 text-left text-sm";

  return (
    <SaveIndicator status={status} editable={!disabled} theme={theme}>
      {editing && !disabled ? (
        <input
          autoFocus
          type="number"
          step={precision === 0 ? "1" : "0.01"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className={inputClass}
        />
      ) : (
        <button type="button" disabled={disabled} onClick={() => setEditing(true)} className={displayClass}>
          {typeof value === "number" ? value : "—"}
        </button>
      )}
    </SaveIndicator>
  );
}
