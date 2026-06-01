# Airtable configuration

The dashboard uses a **single Airtable credential** (`AIRTABLE_API_KEY`). Base IDs and table IDs are **not** stored in environment variables.

## How it works

1. **`lib/airtable/config/registry.ts`** — maps each integration to human-readable base and table names (e.g. `"Google Ads Campaign Analytics"`).
2. **`lib/airtable/meta/resolve-base.ts`** — calls `GET /v0/meta/bases` once per cache window and resolves base names → base IDs (trim-insensitive match).
3. **`lib/airtable/core/base-table-client.ts`** — shared client that fetches records using base name + table name. Airtable accepts table names in record URLs.

## Environment

```env
AIRTABLE_API_KEY=pat...
```

That is the only Airtable variable required. Remove legacy vars from `.env.local` if present:

- `AIRTABLE_BASE_ID`
- `AIRTABLE_*_TABLE_ID`
- `AIRTABLE_*_BASE_ID`

## Registered bases

| Key | Base name | Used by |
|-----|-----------|---------|
| `seo` | ENERGYbits SEO & AI Automation System | SEO Analytics, Keywords, Blog Pipeline, GA4, AEO |
| `googleAds` | Google Ads Daily Performance | Google Ads Analytics |
| `criteo` | Criteo Analytics | Criteo Ads Analytics |
| `vibe` | Vibe.co Analytics | Vibe.co Analytics |
| `klaviyo` | Klaviyo Analytics | Klaviyo Analytics |
| `meta` | Metadata analysis | Meta Analytics |

## Adding a new integration

1. Add the base and table names to `AIRTABLE_BASES` in `registry.ts`.
2. Create a client using `AirtableBaseTableClient` (see `lib/google-ads/client.ts`).
3. Export `isAirtableConfigured as isYourFeatureConfigured` from a thin `env.ts` if needed for page guards.

## API key scopes

The personal access token must have read (and write, for blog pipeline) access to all bases listed in the registry.

## Caching

Base ID resolution is cached for 1 hour via Next.js `fetch` revalidation (`airtable-meta-bases` tag). Record fetches use per-integration cache tags (typically 5 minutes).
