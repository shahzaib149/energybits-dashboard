"use client";

import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";

export function CheckboxEditor({
  value,
  disabled,
  status,
  onSave
}: {
  value?: boolean;
  disabled?: boolean;
  status: SaveStatus;
  onSave: (value: boolean) => Promise<any> | void;
}) {
  return (
    <SaveIndicator status={status} editable={!disabled}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => void onSave(!value)}
        className="rounded-lg px-2 py-1.5 text-lg"
      >
        {value ? "✅" : "❌"}
      </button>
    </SaveIndicator>
  );
}
