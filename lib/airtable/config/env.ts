/**
 * Single Airtable credential — base and table IDs are resolved via the Meta API.
 */

export function getAirtableApiKey(): string {
  const key = process.env.AIRTABLE_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing AIRTABLE_API_KEY environment variable. Copy .env.example to .env.local and set your Airtable personal access token."
    );
  }
  return key;
}

export function isAirtableConfigured(): boolean {
  return Boolean(process.env.AIRTABLE_API_KEY?.trim());
}
