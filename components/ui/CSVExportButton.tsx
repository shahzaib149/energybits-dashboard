"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { COPY } from "@/lib/copy";
import { buildCSV, downloadCSV, type CSVColumn } from "@/lib/csv/build";
import { cn } from "@/lib/utils";

const LARGE_THRESHOLD = 5000;
const BLOCK_THRESHOLD = 25000;

interface CSVExportButtonProps<T> {
  data: T[];
  columns: CSVColumn<T>[];
  filename: string;
  resourceType: string;
  className?: string;
}

export function CSVExportButton<T>({ data, columns, filename, resourceType, className }: CSVExportButtonProps<T>) {
  const copy = COPY.csvExport;
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (data.length === 0) {
      toast.error(copy.noData);
      return;
    }

    if (data.length > BLOCK_THRESHOLD) {
      toast.error(copy.blocked);
      return;
    }

    if (data.length > LARGE_THRESHOLD) {
      const confirmed = window.confirm(copy.largeWarning.replace("{count}", String(data.length)));
      if (!confirmed) return;
    }

    setExporting(true);
    try {
      const csv = buildCSV(data, columns);
      downloadCSV(csv, filename);
      toast.success(copy.success);

      fetch("/api/audit/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType, rowCount: data.length, filename })
      }).catch((err) => console.error("Audit log for export failed:", err));
    } catch {
      toast.error(copy.failed);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      title={copy.tooltip}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-textSecondary transition hover:border-brand/40 hover:text-textPrimary disabled:opacity-60",
        className
      )}
    >
      {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      {exporting ? copy.exporting : copy.button}
    </button>
  );
}
