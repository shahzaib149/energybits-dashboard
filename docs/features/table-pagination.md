# Table Pagination

Reusable client-side pagination for analytics and admin tables across the ENERGYbits dashboard.

## Components

| File | Purpose |
|------|---------|
| `hooks/usePagination.ts` | Slice logic, page state, reset on filter/search changes |
| `components/ui/TablePagination.tsx` | Footer controls (first/prev/next/last, page size, row counts) |
| `components/ui/TableSearch.tsx` | Search input styled for light or dark tables |
| `components/ui/PaginatedTable.tsx` | All-in-one table wrapper: search + paginated rows + footer |

## Defaults

- **Page size:** 25 rows (options: 10, 25, 50, 100)
- **Search:** Shown when the dataset has ≥ 8 rows
- **Theme:** Dark (`variant="dark"`) for analytics surfaces; light for legacy `DataTable`

## Usage

### PaginatedTable (recommended for analytics)

```tsx
<PaginatedTable
  rows={sortedRows}
  columns={[
    {
      id: "name",
      header: "Name",
      searchValue: (row) => row.name,
      render: (row) => row.name
    }
  ]}
  getRowKey={(row) => row.id}
  searchPlaceholder="Search…"
/>
```

### Manual (expandable rows, custom layout)

Use `usePagination`, `TableSearch`, and `TablePagination` directly when rows need extra UI (e.g. blog pipeline actions, SEO expand/collapse, audit log metadata).

## Where applied

- **Vibe.co:** Detail, Campaigns, Channels, Creatives tabs
- **Criteo Ads:** Daily, Campaigns, Ads tabs
- **Google Ads:** Campaigns, Keywords, Ad Groups, Creatives tables
- **Blog Pipeline:** Status table
- **SEO Analytics:** Critical opportunities, Low CTR, Top sources
- **Admin:** Audit log
- **Legacy:** `DataTable` (light theme)

CSV export always uses the **full filtered dataset**, not just the current page.
