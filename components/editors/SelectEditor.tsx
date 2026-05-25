"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { SaveIndicator, type EditorTheme } from "@/components/SaveIndicator";
import { SaveStatus } from "@/hooks/useEditableRecord";
import { SelectChoice } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SelectEditor({
  value,
  disabled,
  status,
  options,
  context,
  onSave,
  theme = "light"
}: {
  value?: string;
  disabled?: boolean;
  status: SaveStatus;
  options: SelectChoice[];
  context?: "priority" | "searchIntent" | "blogStatus" | "seoStatus" | "contentStatus" | "aeoStatus" | "platform" | "generic";
  onSave: (value: string) => Promise<any> | void;
  theme?: EditorTheme;
}) {
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <SaveIndicator status={status} editable={!disabled} theme={theme}>
      <div className="relative">
        <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="rounded-lg px-2 py-1.5 text-left">
          <Badge value={value} context={context} theme={theme} />
        </button>
        {open && !disabled ? (
          <div
            className={cn(
              "absolute z-20 mt-2 min-w-40 rounded-xl border p-2 shadow-soft",
              isDark ? "border-border bg-surfaceElevated" : "border-slate-200 bg-white"
            )}
          >
            {options.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await onSave(option.name);
                }}
                className={cn(
                  "flex w-full rounded-lg px-3 py-2 text-left text-sm",
                  isDark ? "text-textPrimary hover:bg-surface" : "hover:bg-slate-50"
                )}
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
