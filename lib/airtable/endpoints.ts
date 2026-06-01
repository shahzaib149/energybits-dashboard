export const AIRTABLE_API_ROOT = "https://api.airtable.com/v0";

/** Accepts a table ID or URL-encoded table name. */
export function tableRecordsPath(baseId: string, tableNameOrId: string): string {
  return `${AIRTABLE_API_ROOT}/${baseId}/${encodeURIComponent(tableNameOrId)}`;
}
