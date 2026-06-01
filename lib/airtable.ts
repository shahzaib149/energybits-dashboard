import { AirtableFieldSchema, AirtableRecord, AirtableTableSchema, AirtableValue } from "@/lib/types";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { AIRTABLE_BASES } from "@/lib/airtable/config/registry";
import { resolveSeoBaseId } from "@/lib/airtable/meta/resolve-base";
import { tableRecordsPath } from "@/lib/airtable/endpoints";

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

async function getSeoApiRoot(): Promise<string> {
  const baseId = await resolveSeoBaseId();
  return `https://api.airtable.com/v0/${baseId}`;
}

export async function fetchTable<T extends Record<string, AirtableValue>>(
  tableName: string
): Promise<AirtableRecord<T>[]> {
  const apiKey = getAirtableApiKey();
  const apiRoot = await getSeoApiRoot();
  const records = new Map<string, AirtableRecord<T>>();
  let offset: string | undefined;
  let restartCount = 0;

  while (true) {
    const url = new URL(`${apiRoot}/${encodeURIComponent(tableName)}`);

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`
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
  const apiKey = getAirtableApiKey();
  const baseId = await resolveSeoBaseId();
  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
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

/** SEO base name for API routes that need direct Airtable URLs. */
export const SEO_AIRTABLE_BASE_NAME = AIRTABLE_BASES.seo.name;

/** Build a record URL for the SEO base (tableId param is a table name or ID). */
export async function seoTableRecordUrl(tableNameOrId: string, recordId?: string): Promise<string> {
  const baseId = await resolveSeoBaseId();
  const path = tableRecordsPath(baseId, tableNameOrId);
  return recordId ? `${path}/${recordId}` : path;
}
