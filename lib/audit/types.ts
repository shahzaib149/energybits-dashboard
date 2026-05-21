import type { Role } from "@/lib/auth/permissions";

export type AuditLogRow = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AuditLogFilters = {
  action?: string;
  userEmail?: string;
  from?: string;
  to?: string;
};

export function filterAuditRows(rows: AuditLogRow[], filters: AuditLogFilters): AuditLogRow[] {
  return rows.filter((row) => {
    if (filters.action && filters.action !== "all" && row.action !== filters.action) return false;
    if (filters.userEmail && filters.userEmail !== "all" && row.user_email !== filters.userEmail) return false;
    if (filters.from && new Date(row.created_at) < new Date(filters.from)) return false;
    if (filters.to) {
      const to = new Date(filters.to);
      to.setHours(23, 59, 59, 999);
      if (new Date(row.created_at) > to) return false;
    }
    return true;
  });
}

export function uniqueAuditActions(rows: AuditLogRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.action))).sort();
}

export function uniqueAuditEmails(rows: AuditLogRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.user_email).filter(Boolean) as string[])).sort();
}

export type { Role };
