"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { COPY } from "@/lib/copy";
import type { DataBounds, DateRange, DateRangePreset } from "@/lib/date-range/types";
import { formatDateRangeLabel, formatDateShort } from "@/lib/date-range/format";
import { cn } from "@/lib/utils";

const PRESETS: DateRangePreset[] = ["7d", "14d", "21d", "28d"];

interface DateRangePickerProps {
  current: DateRange;
  showInvalidToast?: boolean;
  /**
   * When provided, enables two extra sections in the dropdown:
   * 1. "Last N days" custom input  — navigates with ?days=N
   * 2. "From / To" date inputs     — navigates with ?dateRange=custom&from=&to=
   * Also shows an "Available data" header with the actual data bounds.
   */
  dataBounds?: DataBounds | null;
}

export function DateRangePicker({ current, showInvalidToast, dataBounds }: DateRangePickerProps) {
  const copy = COPY.dateRange;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showInvalidToast) toast.error(copy.invalidRange);
  }, [showInvalidToast, copy.invalidRange]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function navigate(updater: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function selectPreset(preset: DateRangePreset) {
    navigate(p => {
      p.set("dateRange", preset);
      p.delete("days");
      p.delete("from");
      p.delete("to");
    });
  }

  function applyCustomDays() {
    const n = parseInt(customDaysInput, 10);
    if (!Number.isFinite(n) || n < 1 || n > 366) {
      toast.error("Enter a number between 1 and 366.");
      return;
    }
    navigate(p => {
      p.delete("dateRange");
      p.delete("from");
      p.delete("to");
      p.set("days", String(n));
    });
    setCustomDaysInput("");
  }

  function applyCustomRange() {
    if (!rangeFrom || !rangeTo) {
      toast.error(copy.invalidRange);
      return;
    }
    if (rangeFrom > rangeTo) {
      toast.error(copy.invalidRange);
      return;
    }
    navigate(p => {
      p.set("dateRange", "custom");
      p.set("from", rangeFrom);
      p.set("to", rangeTo);
      p.delete("days");
    });
    setRangeFrom("");
    setRangeTo("");
  }

  const isCustomActive = current.preset === "custom";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surfaceElevated px-3 py-1.5 text-xs font-medium text-textPrimary transition hover:border-brand/40"
        title={copy.tooltip}
        aria-label={copy.label}
      >
        {formatDateRangeLabel(current)}
        <ChevronDown className={cn("h-3.5 w-3.5 text-textMuted transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-[240px] rounded-lg border border-border bg-surfaceElevated shadow-xl">

          {/* Available data bounds header */}
          {dataBounds ? (
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                Available data
              </p>
              <p className="mt-0.5 text-xs font-medium text-textPrimary">
                {formatDateShort(dataBounds.minDate)}
                <span className="mx-1 text-textMuted">–</span>
                {formatDateShort(dataBounds.maxDate)}
              </p>
            </div>
          ) : null}

          {/* Preset buttons */}
          <div className="py-1">
            {PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => selectPreset(preset)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-textPrimary hover:bg-surface"
              >
                <span>{copy.presets[preset as keyof typeof copy.presets]}</span>
                {!isCustomActive && current.preset === preset ? (
                  <Check className="h-3.5 w-3.5 text-brand" aria-hidden />
                ) : null}
              </button>
            ))}
          </div>

          {/* Custom options — only shown when dataBounds provided */}
          {dataBounds ? (
            <>
              {/* Custom day count */}
              <div className="border-t border-border px-3 py-2.5">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                  Last N days
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={366}
                    placeholder="e.g. 20"
                    value={customDaysInput}
                    onChange={e => setCustomDaysInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && applyCustomDays()}
                    className="w-full rounded border border-border bg-surface px-2 py-1.5 text-xs text-textPrimary placeholder:text-textMuted focus:border-brand/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyCustomDays}
                    className="shrink-0 rounded bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90"
                  >
                    Go
                  </button>
                </div>
              </div>

              {/* Custom date range */}
              <div className="border-t border-border px-3 py-2.5">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                  Date range
                </p>
                <div className="space-y-1.5">
                  <div>
                    <label className="mb-0.5 block text-[10px] text-textMuted">From</label>
                    <input
                      type="date"
                      value={rangeFrom}
                      min={dataBounds.minDate}
                      max={dataBounds.maxDate}
                      onChange={e => setRangeFrom(e.target.value)}
                      className="w-full rounded border border-border bg-surface px-2 py-1.5 text-xs text-textPrimary focus:border-brand/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] text-textMuted">To</label>
                    <input
                      type="date"
                      value={rangeTo}
                      min={rangeFrom || dataBounds.minDate}
                      max={dataBounds.maxDate}
                      onChange={e => setRangeTo(e.target.value)}
                      className="w-full rounded border border-border bg-surface px-2 py-1.5 text-xs text-textPrimary focus:border-brand/60 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCustomRange}
                    disabled={!rangeFrom || !rangeTo}
                    className="w-full rounded bg-brand px-2 py-1.5 text-xs font-medium text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Apply range
                  </button>
                </div>
              </div>
            </>
          ) : null}

        </div>
      ) : null}
    </div>
  );
}
