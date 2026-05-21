# Session 3: Date Range Filters + CSV Export

Final polish: time-window filters on analytics pages and CSV export on every data table.

## Date range filters

**Pages:** `/overview`, `/seo-analytics`, `/google-ads-analytics`

**Not included:** `/aeo-analytics`, `/geo-analytics`, recommendation/workflow pages.

### URL schema

| Preset | URL |
|--------|-----|
| Last 7 days | `?dateRange=7d` |
| Last 28 days (default) | `?dateRange=28d` or omit param |
| Last 90 days | `?dateRange=90d` |
| Last 12 months | `?dateRange=12m` |
| Custom | `?dateRange=custom&from=YYYY-MM-DD&to=YYYY-MM-DD` |

Tab switches preserve `dateRange` (and custom `from`/`to`) via existing `TabsNav` query-param cloning.

### Implementation

| Path | Role |
|------|------|
| `lib/date-range/types.ts` | `DateRange`, `DateRangePreset` |
| `lib/date-range/parse.ts` | `parseDateRange()`, validation, fallbacks |
| `lib/date-range/format.ts` | Display labels, export filename suffix |
| `lib/date-range/airtable-filter.ts` | Airtable `filterByFormula` for `{End Date}` / `{Date}` |
| `components/ui/DateRangePicker.tsx` | Reusable pill dropdown (client) |
| `components/ui/CustomRangeCalendar.tsx` | Native date inputs for custom range |

Server-side filtering uses Airtable formulas. Fetch cache tags include `from` and `to` per range.

Overview health scores and Top 3 Actions inherit the selected window for SEO + Google Ads data.

## CSV export

**Component:** `components/ui/CSVExportButton.tsx`  
**Builder:** `lib/csv/build.ts` (UTF-8 BOM, RFC 4180 escaping)  
**Audit:** `POST /api/audit/export` → `data.exported`

All roles can export (`permissions.canExportData()`). Every export is audit-logged.

### Tables with export

- **SEO Analytics:** top keywords, critical, low CTR, page 2, top pages, high engagement, poor performance, top sources
- **Google Ads:** campaigns, ad groups, creatives, all keywords, high spend / low conversion keywords
- **AEO Analytics:** prompts grid, neutral domains, all prompts
- **Blog pipeline:** status table
- **Admin:** audit log

Filename pattern: `energybits-{slug}-{from}-to-{to}.csv` (or today's date when no range applies).

Large exports: confirm dialog above 5,000 rows; blocked above 25,000.

## Scripts

```bash
npm run typecheck
npm run build
```
