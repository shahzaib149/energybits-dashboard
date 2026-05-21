import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/getServerUser";
import { permissions } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { COPY } from "@/lib/copy";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import type { AuditLogRow } from "@/lib/audit/types";

export const metadata: Metadata = {
  title: COPY.auth.auditLog.metaTitle,
  description: COPY.auth.auditLog.description
};

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const user = await getServerUser();
  if (!user || !permissions.canViewAuditLog(user.role)) {
    redirect("/overview");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(COPY.auth.auditLog.loadError);
  }

  const rows = (data ?? []) as AuditLogRow[];
  const copy = COPY.auth.auditLog;

  return (
    <div className="overview-theme mx-auto w-full max-w-[1400px] space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">{copy.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-textPrimary lg:text-3xl">{copy.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-textSecondary">{copy.description}</p>
      </header>
      <AuditLogTable rows={rows} />
    </div>
  );
}
