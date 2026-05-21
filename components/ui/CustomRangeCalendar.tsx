"use client";

import { COPY } from "@/lib/copy";
import { isValidYYYYMMDD } from "@/lib/date-range/parse";

export interface CustomRangeCalendarProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function CustomRangeCalendar({ from, to, onFromChange, onToChange }: CustomRangeCalendarProps) {
  const copy = COPY.dateRange;

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <p className="text-xs font-medium text-textSecondary">{copy.customPickerTitle}</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-textMuted">From</span>
          <input
            type="date"
            value={from}
            max={to && isValidYYYYMMDD(to) ? to : undefined}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-textPrimary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-textMuted">To</span>
          <input
            type="date"
            value={to}
            min={from && isValidYYYYMMDD(from) ? from : undefined}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-textPrimary"
          />
        </label>
      </div>
    </div>
  );
}
