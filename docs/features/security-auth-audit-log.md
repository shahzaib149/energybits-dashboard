# Security, Authentication & Audit Log (Session 1)

Session 1 adds role-based auth, secrets hygiene, and an admin audit log.

## Overview

- **Roles:** `admin`, `editor`, `viewer` stored in `public.profiles`
- **Provisioning:** Admin invites only (no auto-create on signup)
- **Audit log:** Server-side writes via service role; admin-only read via RLS

## Key files

| Path | Purpose |
|------|---------|
| `lib/auth/permissions.ts` | Role capability helpers — use everywhere, never inline role checks |
| `lib/auth/getServerUser.ts` | Cached server user + profile |
| `lib/supabase/admin.ts` | Service-role client (server-only) |
| `lib/audit/logger.ts` | `logAuditEvent()` — never throws |
| `lib/supabase/middleware.ts` | Auth + profile + admin route guards |
| `app/admin/audit-log/` | Admin audit log viewer |
| `scripts/disable-test-users.mjs` | Ban legacy test accounts |
| `scripts/invite-users.mjs` | Magic-link invites + profile upsert |

## Database

Run `supabase/migrations/003_profiles_roles_audit_log.sql` in Supabase SQL Editor.

## Audit events (Session 1)

| Action | Trigger |
|--------|---------|
| `auth.login` | Login server action success, auth callback (magic link) |
| `auth.login_failed` | Login server action failure |
| `auth.logout` | Sign-out route |
| `blog.topic_submitted` | Airtable create route when blog title present |

Placeholders ready for Session 2+: `blog.topic_edited`, `blog.topic_deleted`, `gsc.status_changed`, `data.exported`, `user.invited`, `user.role_changed`.

## Related docs

- [Deployment & env vars](../deployment.md)
- [Secrets audit May 2026](../SECRETS_AUDIT_2026-05.md)
