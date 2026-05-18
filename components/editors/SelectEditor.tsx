"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { SelectChoice } from "@/lib/types";

export function SelectEditor({
  value,
  disabled,
  status,
  options,
  context,
  onSave
}: {
  value?: string;
  disabled?: boolean;
  status: SaveStatus;
  options: SelectChoice[];
  context?: "priority" | "searchIntent" | "blogStatus" | "seoStatus" | "contentStatus" | "aeoStatus" | "platform" | "generic";
  onSave: (value: string) => Promise<any> | void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SaveIndicator status={status} editable={!disabled}>
      <div className="relative">
        <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="rounded-lg px-2 py-1.5 text-left">
          <Badge value={value} context={context} />
        </button>
        {open && !disabled ? (
          <div className="absolute z-20 mt-2 min-w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-soft">
            {options.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await onSave(option.name);
                }}
                className="flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {option.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </SaveIndicator>
  );
}
