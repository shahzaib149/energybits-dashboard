# Add `Action Status` field to SEO Tracking (Airtable)

This field powers the GSC status toggle on **SEO Analytics** and the Top 3 Actions panel on **Overview**.

## Steps

1. Open your **SEO Airtable base** (`AIRTABLE_BASE_ID`).
2. Open the **SEO Tracking** table (same table as `AIRTABLE_SEO_TRACKING_TABLE_ID`).
3. Click **+** to add a new field.
4. Configure:

| Setting | Value |
|---------|--------|
| Field name | `Action Status` |
| Field type | Single select |
| Default | `Not Started` (optional — the dashboard defaults to this if empty) |

5. Add options:

| Option | Suggested color |
|--------|-----------------|
| Not Started | Gray |
| In Progress | Yellow |
| Done | Green |
| Ignored | Red |

6. Save the field.

## Verify

After saving, refresh **SEO Analytics** (`/seo-analytics`). Critical opportunities and related tables should show an **Action Status** column. If the field is missing, rows default to **Not Started**.

## Notes

- Do not rename the field — the API expects exactly `Action Status`.
- Existing rows can stay blank; the dashboard treats blank as **Not Started**.
