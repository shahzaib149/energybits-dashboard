"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InfoTooltipProps {
  content: string;
  className?: string;
  label?: string;
}

export function InfoTooltip({ content, className, label = "More information" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-textMuted transition hover:bg-surfaceElevated hover:text-textSecondary focus:outline-none focus:ring-2 focus:ring-brand/40"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-xs leading-relaxed text-textSecondary shadow-lg sm:w-72"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
