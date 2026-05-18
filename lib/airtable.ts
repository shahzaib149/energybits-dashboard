import { AirtableFieldSchema, AirtableRecord, AirtableTableSchema, AirtableValue } from "@/lib/types";

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const API_KEY = process.env.AIRTABLE_API_KEY;

if (!BASE_ID) {
  throw new Error("Missing AIRTABLE_BASE_ID environment variable.");
}

if (!API_KEY) {
  throw new Error("Missing AIRTABLE_API_KEY environment variable.");
}

const API_ROOT = `https://api.airtable.com/v0/${BASE_ID}`;
export const AIRTABLE_REVALIDATE_SECONDS = 60;
const MAX_ITERATOR_RESTARTS = 3;

interface AirtableResponse<T extends Record<string, AirtableValue>> {
  records: AirtableRecord<T>[];
  offset?: string;
}

interface AirtableSchemaResponse {
  tables: Array<{
    id: string;
    name: string;
    fields: AirtableFieldSchema[];
  }>;
}

export async function fetchTable<T extends Record<string, AirtableValue>>(
  tableName: string
): Promise<AirtableRecord<T>[]> {
  const records = new Map<string, AirtableRecord<T>>();
  let offset: string | undefined;
  let restartCount = 0;

  while (true) {
    const url = new URL(`${API_ROOT}/${encodeURIComponent(tableName)}`);

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      },
      next: {
        revalidate: AIRTABLE_REVALIDATE_SECONDS
      }
    });

    if (!response.ok) {
      const message = await response.text();

      if (
        response.status === 422 &&
        message.includes("LIST_RECORDS_ITERATOR_NOT_AVAILABLE") &&
        restartCount < MAX_ITERATOR_RESTARTS
      ) {
        offset = undefined;
        restartCount += 1;
        records.clear();
        await new Promise((resolve) => setTimeout(resolve, restartCount * 250));
        continue;
      }

      throw new Error(
        `Airtable request failed for "${tableName}" (${response.status}): ${message || response.statusText}`
      );
    }

    const payload = (await response.json()) as AirtableResponse<T>;

    for (const record of payload.records) {
      records.set(record.id, record);
    }

    if (!payload.offset) {
      break;
    }

    offset = payload.offset;
  }

  return Array.from(records.values());
}

export async function fetchTableSchema(tableName: string): Promise<AirtableTableSchema | null> {
  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    },
    next: {
      revalidate: AIRTABLE_REVALIDATE_SECONDS
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AirtableSchemaResponse;
  const table = payload.tables.find((entry) => entry.name === tableName);

  if (!table) {
    return null;
  }

  return {
    tableName,
    fields: table.fields
  };
}
