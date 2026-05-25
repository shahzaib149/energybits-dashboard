"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { SaveIndicator, type EditorTheme } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { cn } from "@/lib/utils";

export function InlineTextEditor({
  value,
  disabled,
  status,
  onSave,
  displayClassName,
  inputClassName,
  theme = "light"
}: {
  value?: string;
  disabled?: boolean;
  status: SaveStatus;
  onSave: (value: string) => Promise<any> | void;
  displayClassName?: string;
  inputClassName?: string;
  theme?: EditorTheme;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const isDark = theme === "dark";

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

  const defaultInputClass = isDark
    ? "w-full rounded-lg border border-border bg-surfaceElevated px-2 py-1.5 text-sm text-textPrimary outline-none focus:border-brand/50"
    : "w-full rounded-lg border border-blue-300 px-2 py-1.5 text-sm outline-none";

  const defaultDisplayClass = isDark
    ? "block w-full rounded-lg px-2 py-1.5 text-left text-sm text-textPrimary disabled:cursor-default"
    : "block w-full rounded-lg px-2 py-1.5 text-left text-sm text-inherit disabled:cursor-default";

  return (
    <SaveIndicator status={status} editable={!disabled} theme={theme}>
      {editing && !disabled ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className={inputClassName ?? defaultInputClass}
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setEditing(true)}
          className={displayClassName ?? defaultDisplayClass}
        >
          {value || "—"}
        </button>
      )}
    </SaveIndicator>
  );
}
