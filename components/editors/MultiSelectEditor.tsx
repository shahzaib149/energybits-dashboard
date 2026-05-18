"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { SelectChoice } from "@/lib/types";

export function MultiSelectEditor({
  value,
  disabled,
  status,
  options,
  onSave
}: {
  value?: string[];
  disabled?: boolean;
  status: SaveStatus;
  options: SelectChoice[];
  onSave: (value: string[]) => Promise<any> | void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(value ?? []);

  useEffect(() => setDraft(value ?? []), [value]);

  function toggle(option: string) {
    setDraft((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]));
  }

  return (
    <SaveIndicator status={status} editable={!disabled}>
      <div className="relative">
        <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="flex min-h-9 flex-wrap gap-1 rounded-lg px-2 py-1.5 text-left">
          {draft.length > 0 ? draft.map((item) => <Badge key={item} value={item} />) : <span className="text-sm text-cyan-700">+ Add</span>}
        </button>
        {open && !disabled ? (
          <div className="absolute z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-soft">
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option.name} className="flex items-center gap-3 text-sm text-slate-700">
                  <input type="checkbox" checked={draft.includes(option.name)} onChange={() => toggle(option.name)} />
                  {option.name}
                </label>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await onSave(draft);
                }}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </SaveIndicator>
  );
}
