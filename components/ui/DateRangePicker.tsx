"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { COPY } from "@/lib/copy";
import type { DateRange, DateRangePreset } from "@/lib/date-range/types";
import { formatDateRangeLabel } from "@/lib/date-range/format";
import { parseDateRange } from "@/lib/date-range/parse";
import { cn } from "@/lib/utils";

const PRESETS: DateRangePreset[] = ["7d", "14d", "21d", "28d"];

interface DateRangePickerProps {
  current: DateRange;
  showInvalidToast?: boolean;
}

export function DateRangePicker({ current, showInvalidToast }: DateRangePickerProps) {
  const copy = COPY.dateRange;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showInvalidToast) {
      toast.error(copy.invalidRange);
    }
  }, [showInvalidToast, copy.invalidRange]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectPreset(preset: DateRangePreset) {
    const { range } = parseDateRange({ dateRange: preset });
    const params = new URLSearchParams(searchParams.toString());
    params.set("dateRange", range.preset);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surfaceElevated px-3 py-1.5 text-xs font-medium text-textPrimary transition hover:border-brand/40"
        title={copy.tooltip}
        aria-label={copy.label}
      >
        {formatDateRangeLabel(current)}
        <ChevronDown className={cn("h-3.5 w-3.5 text-textMuted transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-[180px] rounded-lg border border-border bg-surfaceElevated py-1 shadow-xl">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => selectPreset(preset)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-textPrimary hover:bg-surface"
            >
              <span>{copy.presets[preset]}</span>
              {current.preset === preset ? (
                <Check className="h-3.5 w-3.5 text-brand" aria-hidden />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
