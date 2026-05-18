"use client";

import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { formatDate } from "@/lib/utils";

export function DateEditor({
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
  const normalized = value ? value.slice(0, 10) : "";
  return (
    <SaveIndicator status={status} editable={!disabled}>
      {disabled ? (
        <div className="rounded-lg px-2 py-1.5 text-sm">{formatDate(value)}</div>
      ) : (
        <input
          type="date"
          value={normalized}
          onChange={(event) => void onSave(event.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-300"
        />
      )}
    </SaveIndicator>
  );
}
