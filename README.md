# Energybits Airtable Dashboard

Next.js 14 dashboard for managing content operations data from Airtable. The app uses the App Router, TypeScript, Tailwind CSS, Recharts, and `lucide-react`, with server-fetched Airtable tables and optimistic client-side editing.

## Features

- Overview dashboard with KPI cards and charts
- Sidebar navigation for all 7 Airtable tables
- Search, pagination, and column visibility controls on table views
- Inline editing with real-time Airtable sync via PATCH
- New record creation via POST
- Blog Pipeline edit slide-over with batch save/discard
- Blog preview page with reader-first article rendering
- Toast notifications and save state indicators

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Recharts
- lucide-react
- react-hot-toast

## Airtable Tables

The app is wired to these exact table names:

1. `Keywords`
2. `Blog Pipeline`
3. `Product Pages`
4. `Repurposed Content`
5. `AEO Tracking`
6. `Monthly Reports`
7. `AEO Prompt Opportunities`

## Environment Variables

Create or update `.env.local` in the project root:

```env
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_API_KEY=your_api_key
```

## Installation

```powershell
npm install
```

## Development

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

```powershell
npm run build
npm run start
```

## Cairrot integration (Overview)

The Overview page loads live AI visibility data from [Cairrot](https://cairrot.com) (replaces the previous static mock dashboard).

### Setup

1. Copy `.env.example` to `.env.local` (if needed) and set:

```env
CAIRROT_API_KEY=your_api_key
CAIRROT_API_BASE_URL=https://api.cairrot.com
CAIRROT_PROJECT_ID=proj_xxxxxxxx
```

2. Generate an API key in Cairrot ([API keys docs](https://docs.cairrot.com/docs/api-keys)).
3. Use your project id from Cairrot (format `proj_...`).

### Verify

```powershell
npm run dev
```

Open `http://localhost:3000/overview` and confirm totals match your Cairrot Run Overview. Use the run selector and **Refresh** to invalidate cache (`revalidateTag`).

### API proxy routes

Server-only proxies under `/api/cairrot/*` — the browser never receives `CAIRROT_API_KEY`.

See `CAIRROT_API_DISCOVERY.md` for endpoint mapping and OpenAPI reference.

## Available Routes

- `/` → redirects to `/overview`
- `/overview` - Cairrot Run Overview (live)
- `/keywords`
- `/blog-pipeline`
- `/blog-pipeline/[recordId]/preview` - Reader-first blog preview
- `/product-pages`
- `/repurposed-content`
- `/aeo-tracking`
- `/monthly-reports`
- `/aeo-prompts`

## Editing Workflow

- Edit mode is toggled from the top-right header
- When edit mode is on, editable cells switch to field-specific editors
- Changes are saved immediately to Airtable through `/api/airtable/update`
- New records are created through `/api/airtable/create`
- The Blog Pipeline slide-over supports dirty tracking and batch save

## Blog Preview

The blog preview page renders the blog as a readable article instead of a form-like data panel:

- Title is shown as a large top-level heading
- Content column is centered and constrained to 800px
- Draft body is parsed as Markdown or HTML
- Typography is optimized for long-form reading

## Project Structure

```text
app/
components/
hooks/
lib/
```

## Notes

- The app fetches Airtable data server-side and revalidates every 60 seconds.
- `fetchTable()` handles Airtable pagination and retries once when Airtable invalidates an iterator.
- Some preview/edit behavior depends on Airtable field names matching the configured table definitions exactly.

## Troubleshooting

- If the app fails to load data, verify `AIRTABLE_BASE_ID` and `AIRTABLE_API_KEY`.
- If a table page shows empty or missing fields, confirm the Airtable field names match the project configuration.
- If previews do not render as expected, make sure the draft content is stored in `Human Edited Draft` or `AI Draft`.
