"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Info } from "lucide-react";
import toast from "react-hot-toast";
import { COPY } from "@/lib/copy";
import type { DateRange, DateRangePreset } from "@/lib/date-range/types";
import { formatDateRangeLabel } from "@/lib/date-range/format";
import { isRangeOlderThanMonths, parseDateRange } from "@/lib/date-range/parse";
import { CustomRangeCalendar } from "@/components/ui/CustomRangeCalendar";
import { cn } from "@/lib/utils";

const PRESETS: DateRangePreset[] = ["7d", "28d", "90d", "12m", "custom"];

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
  const [customMode, setCustomMode] = useState(current.preset === "custom");
  const [customFrom, setCustomFrom] = useState(current.from);
  const [customTo, setCustomTo] = useState(current.to);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showInvalidToast) {
      toast.error(copy.invalidRange);
    }
  }, [showInvalidToast, copy.invalidRange]);

  useEffect(() => {
    setCustomFrom(current.from);
    setCustomTo(current.to);
    setCustomMode(current.preset === "custom");
  }, [current.from, current.to, current.preset]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCustomMode(current.preset === "custom");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [current.preset]);

  function navigateWithRange(range: DateRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dateRange", range.preset);
    if (range.preset === "custom") {
      params.set("from", range.from);
      params.set("to", range.to);
    } else {
      params.delete("from");
      params.delete("to");
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function selectPreset(preset: DateRangePreset) {
    if (preset === "custom") {
      setCustomMode(true);
      return;
    }
    const { range } = parseDateRange({ dateRange: preset });
    navigateWithRange(range);
  }

  function applyCustom() {
    if (!customFrom || !customTo || customFrom > customTo) {
      toast.error(copy.invalidRange);
      return;
    }
    navigateWithRange({ preset: "custom", from: customFrom, to: customTo });
  }

  const showFarWarning = isRangeOlderThanMonths(current, 16);

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

      {showFarWarning ? (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-400/90" title={copy.farRangeWarningTooltip}>
          <Info className="h-3 w-3 shrink-0" aria-hidden />
          {copy.farRangeWarning}
        </p>
      ) : null}

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-[220px] rounded-lg border border-border bg-surfaceElevated py-1 shadow-xl">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => selectPreset(preset)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-textPrimary hover:bg-surface"
            >
              <span>{copy.presets[preset]}</span>
              {!customMode && current.preset === preset ? (
                <Check className="h-3.5 w-3.5 text-brand" aria-hidden />
              ) : null}
            </button>
          ))}

          {customMode ? (
            <div className="px-3 pb-2">
              <CustomRangeCalendar
                from={customFrom}
                to={customTo}
                onFromChange={setCustomFrom}
                onToChange={setCustomTo}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={applyCustom}
                  className="flex-1 rounded-md bg-brand px-2 py-1.5 text-xs font-medium text-white hover:bg-brandHover"
                >
                  {copy.apply}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomMode(false);
                    setOpen(false);
                  }}
                  className="flex-1 rounded-md border border-border px-2 py-1.5 text-xs text-textSecondary hover:bg-surface"
                >
                  {copy.cancel}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
