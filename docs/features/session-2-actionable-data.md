# Session 2: Actionable Data

Priority 2 + 4 features: Top 3 Actions, GSC status toggle, blog pipeline status, edit/delete topics.

## Features

| Feature | Route / location |
|---------|------------------|
| Top 3 Actions panel | `/overview` (inside health card, below snapshot) |
| GSC Action Status toggle | `/seo-analytics` → Search tab tables |
| Blog pipeline status | `/blog-pipeline/status` |
| Edit / delete topics | Pipeline status table (Ready only) |
| **Publish → Make.com** | Blog preview page (`/blog-pipeline/[id]/preview`) — **Publish** button triggers webhook |

## Blog publish webhook

When an admin/editor clicks **Publish** on a blog preview, the dashboard POSTs to Make.com:

| Env var | `BLOG_PUBLISH_WEBHOOK_URL` (server-only) |
| API | `POST /api/blog-pipeline/[id]/publish` |
| Payload | `{ recordId, blogTitle, triggeredBy, triggeredAt }` |
| Audit | `blog.publish_triggered` |

Set `BLOG_PUBLISH_WEBHOOK_URL` in Vercel for production.

## Setup required

1. **Supabase migration 004** — run `supabase/migrations/004_dismissed_actions.sql` in SQL Editor (for GA4/Ads dismissals).
2. **Airtable field** — add `Action Status` to SEO Tracking per [add-action-status-field.md](../setup/add-action-status-field.md).

## API routes

| Method | Path | Role | Audit event |
|--------|------|------|-------------|
| PATCH | `/api/airtable/seo-tracking/[recordId]/status` | admin, editor | `gsc.status_changed` |
| POST | `/api/overview/actions/dismiss` | admin, editor | `overview.action_dismissed` |
| PATCH | `/api/blog-pipeline/[id]` | admin, editor | `blog.topic_edited` |
| DELETE | `/api/blog-pipeline/[id]` | admin, editor | `blog.topic_deleted` |

## Key files

- `lib/overview/top-actions.ts` — aggregation + scoring
- `lib/airtable/blog-pipeline.ts` — blog types + mapper
- `components/overview-hub/TopActionsPanel.tsx`
- `components/seo-analytics/StatusToggle.tsx`
- `components/blog-pipeline/*`

## Permissions

All UI and API checks use `lib/auth/permissions.ts` — never inline role strings.
