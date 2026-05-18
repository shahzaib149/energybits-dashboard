# Cairrot API Discovery

> Source: [Create Project](https://docs.cairrot.com/api/create-project), [OpenAPI spec](https://api.cairrot.com/openapi.json) (fetched 2026-05-18).  
> User-specified base `https://api.cairrot.com/v1` is **incorrect**; documented paths use `/api/v1/...` on host `https://api.cairrot.com`.

## Base URL

| Item | Value |
|------|--------|
| **Server** | `https://api.cairrot.com` |
| **API prefix** | `/api/v1` |
| **Recommended `CAIRROT_API_BASE_URL`** | `https://api.cairrot.com` (paths in `lib/cairrot/endpoints.ts` include `/api/v1`) |

## Authentication

| Item | Value |
|------|--------|
| **Scheme** | HTTP Bearer |
| **Header** | `Authorization: Bearer <API_KEY>` |
| **Format** | JWT (`bearerFormat: JWT` in OpenAPI) |
| **Key setup** | [Generate an API Key](https://docs.cairrot.com/docs/api-keys) |

## Response envelope

Production API uses:

```json
{ "status": "success", "data": <T> }
```

OpenAPI also documents:

```json
{ "ok": true, "data": <T> }
```

The dashboard client accepts **both** (`lib/cairrot/parse.ts`).

### List projects (live shape)

`GET /api/v1/projects/list` returns:

```json
{
  "status": "success",
  "data": {
    "projects": [
      { "id": "6a06285ac1f55955b1909d75", "url": "energybits.com", "planCode": "standard" }
    ]
  }
}
```

### List prompts (live shape)

`GET /api/v1/projects/{id}/prompts/list` returns `data.items[]` (not a bare array).

### Search by run

Lucene `run_id:"uuid"` on pagehits search returned **0** results in testing. Use **`startDate` / `endDate`** from the run’s `started_at` / `finished_at`, then filter docs client-side by `run_id`.

Error:

```json
{ "ok": false, "error": { "code": "...", "message": "...", "details": {} } }
```

## Pagination (search endpoints)

Search results use `DocsBundle`:

| Field | Type | Notes |
|-------|------|--------|
| `hasNextPage` | boolean | |
| `hasPrevPage` | boolean | |
| `totalPages` | integer | |
| `totalDocs` | integer | |
| `docs` | array | Page of records |

Query params (shared `OS.*` parameters):

| Param | Default | Notes |
|-------|---------|--------|
| `page` | 1 | 1-based |
| `limit` | 25 | 1–100 |
| `query` | — | Lucene query string (plain or base64 UTF-8) |
| `filter` | — | Additional Lucene clauses (AND-joined) |
| `startDate` | now − 7d | Unix epoch **milliseconds** |
| `endDate` | now | Unix epoch **milliseconds**; max range **31 days** |
| `sortKey` | server default | |
| `sortOrder` | `asc` | `asc` \| `desc` |

## Rate limits

**Not documented** in OpenAPI or fetched doc pages. Treat as unknown; handle `429` in UI.

---

## Endpoints relevant to Run Overview dashboard

### Projects

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/projects/list` | List projects (`id`, `url` only) |
| `GET` | `/api/v1/projects/{id}` | Full project (readiness scores, keywords, competitors, topics) |
| `POST` | `/api/v1/projects` | Create project |

**Readiness fields on project** (`GET /projects/{id}`):

- `lastReadinessScore`, `lastReadinessAt`, `lastReadinessBuckets` (access, structure, content, provenance, performance, safety)
- `keywords[]` — brand name variants

### Runs (latest / list / by id)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/projects/{id}/runs/search` | Search prompt runs |

**`PromptRun` shape** (`data.docs[]`):

| Field | Type |
|-------|------|
| `id` | string |
| `project_id` | string |
| `run_id` | string (UUID) |
| `started_at` | ISO date-time |
| `finished_at` | ISO date-time |
| `prompt_count` | int |
| `result_count` | int |
| `providers` | string[] (`gpt`, `gemini`, `perplexity`, …) |
| `status` | string |

**TODO:** Confirm Lucene field name to filter by `run_id` (assumed `run_id:"<uuid>"` in `query`). See [Searching guide](https://docs.cairrot.com/docs/searching/lucene-intro).

There is **no** documented `GET /runs/{runId}` or `GET /latest-run` endpoint.

### Citations

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/projects/{id}/pagehits/search` | Search citation hits |

**`CitationHit` fields** (abbreviated): `id`, `subject`, `topic`, `provider`, `captured_at`, `rank`, `page.registrable_domain`, `flags.is_competitor`, `flags.mentions_subject`, `competitor_hits.by_name[]`.

### Responses / mentions

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/projects/{id}/responses/search` | Search response mentions |

**`Mention` fields**: `provider`, `analysis.brand_hits.by_name[]`, `analysis.competitor_hits.by_name[]`, `citations[]`.

### Prompts (per-prompt last run stats)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/projects/{id}/prompts/list` | List prompts; each may include `lastRun` with `byProvider` counts/pcts |

Query: `page`, `limit` (default 20, max 100), `topic`, `enabled`.

### Competitors (configuration, not visibility metrics)

| Method | Path | Purpose |
|--------|------|---------|
| `PUT` / `POST` / `DELETE` | `/api/v1/projects/{id}/competitors` | Manage competitor list on project |

**TODO:** No dedicated “competitor visibility %” endpoint. Dashboard derives share from **citation/mention aggregation** + project competitor list.

### Crawler hits (not used in Overview v1)

| Method | Path |
|--------|------|
| `GET` | `/api/v1/projects/{id}/crawler/search` |

---

## Endpoints NOT in OpenAPI (dashboard assumptions)

| Needed for UI | Status |
|---------------|--------|
| Run overview (single payload) | **Compose** from runs/search + pagehits/search + responses/search + prompts/list |
| Latest run | **Compose**: `runs/search` sort `started_at` desc, limit 1 |
| Neutral domains leaderboard | **Compose**: aggregate `pagehits` by `registrable_domain` |
| Competitor visibility % | **Compose**: aggregate citation/mention competitor flags |
| Insights / next actions | **Compose**: heuristic insights in `lib/cairrot/insights.ts` until API exists |
| Dedicated AI readiness | **Use** `GET /projects/{id}` readiness fields |

---

## Dashboard implementation mapping

| App method | Cairrot API |
|------------|-------------|
| `listRuns()` | `GET .../runs/search` |
| `getLatestRun()` | Latest run + aggregations |
| `getRun(runId)` | Filter searches by run + aggregations |
| `getCitations()` | `GET .../pagehits/search` (paginated) |
| `getPrompts()` | `GET .../prompts/list` |
| `getNeutralDomains()` | Aggregate pagehits |
| `getCompetitorVisibility()` | Aggregate pagehits + mentions |
| `getAIReadiness()` | `GET .../projects/{id}` |
| `getInsights()` | Generated client-side |

---

## References

- [Create Project](https://docs.cairrot.com/api/create-project)
- [OpenAPI JSON](https://api.cairrot.com/openapi.json)
- [GEO / product overview](https://docs.cairrot.com/)
