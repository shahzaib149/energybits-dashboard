# Blog Pipeline — Submit Topic (disabled)

**Status:** Removed as of 2026-05. The Blog Pipeline status page (`/blog-pipeline/status`) no longer shows **Submit a topic** or calls the Make.com blog-creation webhook.

## Still active

| Feature | Env / route |
|---------|-------------|
| View pipeline | `/blog-pipeline/status` |
| Edit / delete topics (pre-draft) | `TopicActions`, `EditTopicModal` |
| Preview & sync | `BLOG_PUBLISH_WEBHOOK_URL` / `BLOG_SYNC_WEBHOOK_URL` |
| Publish | `POST /api/blog-pipeline/[id]/publish` |

## To re-enable Submit Topic later

1. Restore deleted modules (from git history):
   - `components/blog-pipeline/SubmitTopicButton.tsx`
   - `components/blog-pipeline/SubmitTopicModal.tsx`
   - `app/api/blog-pipeline/submit/route.ts`
   - `app/api/blog-pipeline/recommendations/route.ts`
   - `lib/blog-pipeline/trigger-webhook.ts`
   - `lib/blog-pipeline/build-submit-prompt.ts`
   - `lib/blog-pipeline/submit-types.ts`
   - `lib/blog-pipeline/match-recommendations.ts`
   - `lib/blog-pipeline/recommendations.ts`
2. Wire `SubmitTopicButton` back into `BlogPipelineStatusView` and `PipelineStatusTable`.
3. Add env: `BLOG_TRIGGER_WEBHOOK_URL` → Make.com scenario that creates the Airtable row + draft.
4. Restore `COPY.blogPipeline.submitCta` / `submitModal` strings in `lib/copy.ts`.

## Former flow

1. User enters blog title → auto-match keyword + AEO prompt from Airtable.
2. `POST /api/blog-pipeline/submit` creates **Blog Pipeline** row.
3. `POST` payload to `BLOG_TRIGGER_WEBHOOK_URL` starts Make.com draft generation.

Audit action `blog.topic_submitted` remains in `lib/audit/logger.ts` for historical log rows.
