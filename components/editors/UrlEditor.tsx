"use client";

import { ExternalLink, Pencil } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function UrlEditor({
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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => setDraft(value ?? ""), [value]);

  async function commit() {
    setEditing(false);
    if (!draft || !isValidUrl(draft) || draft === value) {
      return;
    }
    await onSave(draft);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      void commit();
    }
    if (event.key === "Escape") {
      setEditing(false);
      setDraft(value ?? "");
    }
  }

  return (
    <SaveIndicator status={status} editable={!disabled}>
      {editing && !disabled ? (
        <input
          autoFocus
          type="url"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-blue-300 px-2 py-1.5 text-sm outline-none"
        />
      ) : (
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          {value ? (
            <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-700 hover:underline">
              <span className="truncate">{value}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span>—</span>
          )}
          {!disabled ? (
            <button type="button" onClick={() => setEditing(true)} className="text-slate-400 hover:text-slate-700">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </SaveIndicator>
  );
}
