import { createServiceRoleClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.login_failed"
  | "auth.password_reset_link"
  | "auth.password_reset"
  | "blog.topic_submitted"
  | "blog.topic_edited"
  | "blog.topic_deleted"
  | "blog.publish_triggered"
  | "blog.preview_synced"
  | "gsc.status_changed"
  | "overview.action_dismissed"
  | "data.exported"
  | "user.invited"
  | "user.role_changed";

export interface AuditLogParams {
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    if (!supabase) return;

    await supabase.from("audit_log").insert({
      user_id: params.userId ?? null,
      user_email: params.userEmail ?? null,
      action: params.action,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      metadata: params.metadata ?? {},
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null
    });
  } catch {
    // Never throw — audit must not block user actions
  }
}

export function getRequestContext(req: Request): { ipAddress: string | null; userAgent: string | null } {
  return {
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent") ?? null
  };
}
