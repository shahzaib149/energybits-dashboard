"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ActionStatus } from "@/lib/airtable/types";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

const statusStyles: Record<ActionStatus, string> = {
  "Not Started": "bg-gray-500/20 text-gray-300 border-gray-500/30",
  "In Progress": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Done: "bg-green-500/20 text-green-300 border-green-500/30",
  Ignored: "bg-red-500/20 text-red-300 border-red-500/30"
};

const OPTIONS: ActionStatus[] = ["Not Started", "In Progress", "Done", "Ignored"];

interface StatusToggleProps {
  recordId: string;
  currentStatus: ActionStatus;
  canEdit: boolean;
  onStatusChange?: (status: ActionStatus) => void;
}

export function StatusToggle({ recordId, currentStatus, canEdit, onStatusChange }: StatusToggleProps) {
  const [status, setStatus] = useState(currentStatus);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const copy = COPY.seoAnalytics.actionStatus;

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(next: ActionStatus) {
    if (next === status) {
      setOpen(false);
      return;
    }
    const prev = status;
    setStatus(next);
    setOpen(false);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/airtable/seo-tracking/${recordId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next, oldStatus: prev })
        });
        if (!res.ok) throw new Error("Failed");
        onStatusChange?.(next);
      } catch {
        setStatus(prev);
      }
    });
  }

  return (
    <div className="relative inline-block" ref={ref} title={copy.tooltip}>
      <button
        type="button"
        disabled={!canEdit || pending}
        onClick={() => canEdit && setOpen((v) => !v)}
        className={cn(
          "rounded-full border px-2 py-1 text-xs font-medium transition",
          statusStyles[status],
          canEdit ? "cursor-pointer hover:opacity-90" : "cursor-default opacity-90"
        )}
        aria-label={`${copy.label}: ${status}`}
      >
        {status}
      </button>
      {open && canEdit ? (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-surfaceElevated py-1 shadow-lg">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => select(opt)}
              className="block w-full px-3 py-2 text-left text-xs text-textPrimary hover:bg-surface"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type ActionStatusFilter = "all" | ActionStatus;

export function ActionStatusFilterBar({
  value,
  onChange
}: {
  value: ActionStatusFilter;
  onChange: (v: ActionStatusFilter) => void;
}) {
  const f = COPY.seoAnalytics.actionStatus.filters;
  const pills: { id: ActionStatusFilter; label: string }[] = [
    { id: "all", label: f.all },
    { id: "Not Started", label: f.notStarted },
    { id: "In Progress", label: f.inProgress },
    { id: "Done", label: f.done },
    { id: "Ignored", label: f.ignored }
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <span className="self-center text-xs text-textMuted">Showing:</span>
      {pills.map((pill) => (
        <button
          key={pill.id}
          type="button"
          onClick={() => onChange(pill.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            value === pill.id
              ? "bg-brand/20 text-brand"
              : "bg-surfaceElevated text-textMuted hover:text-textPrimary"
          )}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}

export function filterByActionStatus<T extends { actionStatus: ActionStatus }>(
  rows: T[],
  filter: ActionStatusFilter,
  defaultExcludeDoneIgnored = true
): T[] {
  if (filter === "all") {
    if (defaultExcludeDoneIgnored) {
      return rows.filter((r) => r.actionStatus !== "Done" && r.actionStatus !== "Ignored");
    }
    return rows;
  }
  return rows.filter((r) => r.actionStatus === filter);
}
