export const AIRTABLE_API_ROOT = "https://api.airtable.com/v0";

export function tableRecordsPath(baseId: string, tableId: string): string {
  return `${AIRTABLE_API_ROOT}/${baseId}/${tableId}`;
}
