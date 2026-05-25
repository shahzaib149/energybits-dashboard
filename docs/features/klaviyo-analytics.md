# Klaviyo Analytics

Email marketing metrics from the **Klaviyo Analytics** Airtable base, displayed at `/klaviyo-analytics`.

## Data source

| Airtable field | Mapped property | Description |
|----------------|-----------------|-------------|
| Metric ID | `metricId` | Unique metric type identifier |
| Metric Name | `metricName` | e.g. Clicked Email, Ordered Product |
| Date | `date` | Record date (YYYY-MM-DD) |
| Counts | `counts` | Total event count |
| Order Sum Value | `orderSumValue` | Revenue attributed to the metric |
| Unique Counts | `uniqueCounts` | Unique contacts who performed the action |

## Environment variables

```env
AIRTABLE_API_KEY=...
AIRTABLE_KLAVIYO_BASE_ID=appQ9v3W1WyXg451L
AIRTABLE_KLAVIYO_ANALYTICS_TABLE_ID=tblmMHbElLz7ZNc0R
```

## Key files

| Path | Purpose |
|------|---------|
| `lib/klaviyo/` | Env, client, map, metrics, types |
| `app/klaviyo-analytics/` | Server page, loading, error |
| `components/klaviyo/` | Header, metrics, tabs, charts, tables |
| `lib/copy.ts` → `COPY.klaviyo` | UI strings |
| `lib/csv/columns.ts` | CSV export columns |

## Tabs

1. **Overview** — daily event trend, top metrics chart, metric breakdown, order revenue trend
2. **Metrics** — aggregated table by metric name with CSV export
3. **Records** — paginated row-level data with search and CSV export

## Date filtering

Uses Airtable field `Date` via `klaviyoDateInRangeFormula()` in `lib/date-range/airtable-filter.ts`.

## Related docs

- [Deployment & env vars](../deployment.md)
- [Table pagination](./table-pagination.md)
