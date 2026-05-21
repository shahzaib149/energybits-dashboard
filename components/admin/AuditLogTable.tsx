"use client";

import { Fragment, useMemo, useState } from "react";
import { CSVExportButton } from "@/components/ui/CSVExportButton";
import { TablePagination } from "@/components/ui/TablePagination";
import { TableSearch } from "@/components/ui/TableSearch";
import { usePagination } from "@/hooks/usePagination";
import { staticFilename } from "@/lib/csv/columns";
import type { CSVColumn } from "@/lib/csv/build";
import type { AuditLogRow } from "@/lib/audit/types";
import { filterAuditRows, uniqueAuditActions, uniqueAuditEmails } from "@/lib/audit/types";
import { COPY } from "@/lib/copy";
import { formatDateTime } from "@/lib/utils/format";

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AuditLogFilters({
  rows,
  onFilter
}: {
  rows: AuditLogRow[];
  onFilter: (filtered: AuditLogRow[]) => void;
}) {
  const actions = useMemo(() => uniqueAuditActions(rows), [rows]);
  const emails = useMemo(() => uniqueAuditEmails(rows), [rows]);
  const copy = COPY.auth.auditLog.filters;

  const [action, setAction] = useState("all");
  const [userEmail, setUserEmail] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function apply() {
    onFilter(filterAuditRows(rows, { action, userEmail, from: from || undefined, to: to || undefined }));
  }

  function reset() {
    setAction("all");
    setUserEmail("all");
    setFrom("");
    setTo("");
    onFilter(rows);
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-surfaceElevated p-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="text-xs">
        <span className="mb-1 block text-textMuted">{copy.action}</span>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-textPrimary"
        >
          <option value="all">{copy.all}</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs">
        <span className="mb-1 block text-textMuted">{copy.user}</span>
        <select
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-textPrimary"
        >
          <option value="all">{copy.all}</option>
          {emails.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs">
        <span className="mb-1 block text-textMuted">{copy.from}</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-textPrimary"
        />
      </label>
      <label className="text-xs">
        <span className="mb-1 block text-textMuted">{copy.to}</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-textPrimary"
        />
      </label>
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={apply}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-background hover:bg-brandHover"
        >
          {copy.apply}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-border px-3 py-2 text-sm text-textSecondary hover:bg-surface"
        >
          {copy.reset}
        </button>
      </div>
    </div>
  );
}

const auditColumns: CSVColumn<AuditLogRow>[] = [
  { key: "created_at", label: "When" },
  { key: "user_email", label: "Who" },
  { key: "action", label: "Action" },
  { key: "resource_type", label: "Resource Type" },
  { key: "resource_id", label: "Resource ID" },
  {
    key: "metadata",
    label: "Metadata",
    format: (v) => JSON.stringify(v ?? {})
  }
];

export function AuditLogTable({ rows }: { rows: AuditLogRow[] }) {
  const copy = COPY.auth.auditLog;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtered, setFiltered] = useState(rows);
  const [search, setSearch] = useState("");
  const searched = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return filtered;
    return filtered.filter((row) =>
      [row.user_email, row.action, row.resource_type, row.resource_id].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [filtered, search]);
  const { paginatedItems, page, setPage, pageSize, setPageSize, totalPages, totalRows } = usePagination(searched, {
    resetDeps: [search, filtered.length]
  });

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-textMuted">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AuditLogFilters rows={rows} onFilter={setFiltered} />
        <CSVExportButton
          data={filtered}
          columns={auditColumns}
          filename={staticFilename("audit-log")}
          resourceType="audit-log"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface p-4 sm:p-6">
        {filtered.length >= 8 ? (
          <TableSearch value={search} onChange={setSearch} placeholder="Search audit log…" className="mb-4" />
        ) : null}
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-[1] bg-surface">
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-textMuted">
              <th className="px-4 py-3">{copy.columns.when}</th>
              <th className="px-4 py-3">{copy.columns.who}</th>
              <th className="px-4 py-3">{copy.columns.action}</th>
              <th className="px-4 py-3">{copy.columns.resource}</th>
              <th className="px-4 py-3">{copy.columns.metadata}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-textMuted">
                  No rows match your search.
                </td>
              </tr>
            ) : (
              paginatedItems.map((row) => (
              <Fragment key={row.id}>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-3 whitespace-nowrap" title={formatDateTime(row.created_at)}>
                    {relativeTime(row.created_at)}
                  </td>
                  <td className="px-4 py-3">{row.user_email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                  <td className="px-4 py-3 text-textSecondary">
                    {row.resource_type ?? "—"}
                    {row.resource_id ? ` · ${row.resource_id.slice(0, 8)}…` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                      className="text-xs text-brand hover:underline"
                    >
                      {expandedId === row.id ? copy.hideMeta : copy.viewMeta}
                    </button>
                  </td>
                </tr>
                {expandedId === row.id ? (
                  <tr className="bg-surfaceElevated">
                    <td colSpan={5} className="px-4 py-3">
                      <pre className="overflow-x-auto text-xs text-textSecondary">
                        {JSON.stringify(row.metadata ?? {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
              ))
            )}
          </tbody>
        </table>
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          totalRows={totalRows}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
