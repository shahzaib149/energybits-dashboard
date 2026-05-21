"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "light" | "dark";
}

export function TableSearch({
  value,
  onChange,
  placeholder = "Search rows…",
  className,
  variant = "dark"
}: TableSearchProps) {
  const inputClass =
    variant === "light"
      ? "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
      : "w-full rounded-xl border border-border bg-surfaceElevated py-2.5 pl-10 pr-4 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-brand/50";

  const iconClass = variant === "light" ? "text-slate-400" : "text-textMuted";

  return (
    <div className={cn("relative max-w-md", className)}>
      <Search className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", iconClass)} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
        aria-label={placeholder}
      />
    </div>
  );
}
