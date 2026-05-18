"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { EditorSheet } from "@/components/editors/EditorSheet";

export function MultilineEditor({
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => setDraft(value ?? ""), [value]);

  return (
    <>
      <SaveIndicator status={status} editable={!disabled}>
        <button type="button" disabled={disabled} onClick={() => setOpen(true)} className="flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left">
          <span className="line-clamp-2 text-sm text-slate-700">{value || "—"}</span>
          {!disabled ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> : null}
        </button>
      </SaveIndicator>
      <EditorSheet
        open={open}
        title="Edit text"
        onClose={() => {
          setDraft(value ?? "");
          setOpen(false);
        }}
        footer={
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{draft.length} characters</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraft(value ?? "");
                  setOpen(false);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  if (draft !== (value ?? "")) {
                    await onSave(draft);
                  }
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        }
      >
        <textarea
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="field-textarea min-h-64"
        />
      </EditorSheet>
    </>
  );
}
