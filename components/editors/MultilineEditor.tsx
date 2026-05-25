"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { SaveIndicator, type EditorTheme } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { cn } from "@/lib/utils";

export function MultilineEditor({
  value,
  disabled,
  status,
  onSave,
  displayClassName,
  theme = "light"
}: {
  value?: string;
  disabled?: boolean;
  status: SaveStatus;
  onSave: (value: string) => Promise<any> | void;
  displayClassName?: string;
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

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      setDraft(value ?? "");
      setEditing(false);
    }
  }

  const textareaClass = isDark
    ? "w-full min-h-24 resize-y rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm leading-relaxed text-textPrimary outline-none focus:border-brand/50"
    : "field-textarea min-h-24";

  const displayClass = isDark
    ? "line-clamp-3 whitespace-pre-wrap text-sm text-textPrimary"
    : "line-clamp-2 text-sm text-slate-700";

  if (editing && !disabled) {
    return (
      <SaveIndicator status={status} editable={false} theme={theme}>
        <textarea
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className={textareaClass}
        />
      </SaveIndicator>
    );
  }

  return (
    <SaveIndicator status={status} editable={!disabled} theme={theme}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setEditing(true)}
        className={cn("w-full rounded-lg px-2 py-1.5 text-left", disabled ? "cursor-default" : "hover:bg-surfaceElevated/60")}
      >
        <span className={displayClassName ?? displayClass}>{value || "—"}</span>
      </button>
    </SaveIndicator>
  );
}
