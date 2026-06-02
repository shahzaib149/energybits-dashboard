export type Role = "admin" | "editor" | "viewer";

/** Maps legacy Supabase profile roles to current Role union. */
export function normalizeRole(role: string | null | undefined): Role {
  if (role === "admin") return "admin";
  if (role === "editor" || role === "user") return "editor";
  return "viewer";
}

export const permissions = {
  canSubmitBlogTopic: (role: Role) => role === "admin" || role === "editor",
  canEditBlogTopic: (role: Role) => role === "admin" || role === "editor",
  canPublishBlog: (role: Role) => role === "admin" || role === "editor",
  canToggleGSCStatus: (role: Role) => role === "admin" || role === "editor",
  canDismissTopAction: (role: Role) => role === "admin" || role === "editor",
  canManageUsers: (role: Role) => role === "admin",
  canViewAuditLog: (role: Role) => role === "admin",
  canManageCronSettings: (role: Role) => role === "admin",
  canExportData: (_role: Role) => true
};
