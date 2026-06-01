import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { AIRTABLE_BASES, type AirtableBaseKey } from "@/lib/airtable/config/registry";

const META_BASES_URL = "https://api.airtable.com/v0/meta/bases";
const META_REVALIDATE_SECONDS = 3600;

interface MetaBasesResponse {
  bases: Array<{ id: string; name: string }>;
}

function normalizeBaseName(name: string): string {
  return name.trim().toLowerCase();
}

let baseIdByName: Map<string, string> | null = null;
let loadPromise: Promise<Map<string, string>> | null = null;

function registryFallbackMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of Object.values(AIRTABLE_BASES)) {
    if ("id" in entry && entry.id) {
      map.set(normalizeBaseName(entry.name), entry.id);
    }
  }
  return map;
}

async function loadBaseIdMap(apiKey: string): Promise<Map<string, string>> {
  const response = await fetch(META_BASES_URL, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    },
    next: {
      revalidate: META_REVALIDATE_SECONDS,
      tags: ["airtable-meta-bases"]
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to list Airtable bases (${response.status}): ${message || response.statusText}`);
  }

  const payload = (await response.json()) as MetaBasesResponse;
  const map = new Map<string, string>();

  for (const base of payload.bases) {
    map.set(normalizeBaseName(base.name), base.id);
  }

  return map;
}

async function getBaseIdMap(): Promise<Map<string, string>> {
  if (baseIdByName) return baseIdByName;

  if (!loadPromise) {
    loadPromise = loadBaseIdMap(getAirtableApiKey())
      .then((map) => {
        baseIdByName = map;
        return map;
      })
      .catch((error) => {
        loadPromise = null;
        const fallback = registryFallbackMap();
        if (fallback.size > 0) {
          console.warn(
            "[airtable] Meta API base list failed; using registry fallback IDs:",
            error instanceof Error ? error.message : error
          );
          baseIdByName = fallback;
          return fallback;
        }
        throw error;
      });
  }

  return loadPromise;
}

/** Resolve an Airtable base ID from its display name (trim-insensitive match). */
export async function resolveBaseId(baseName: string): Promise<string> {
  const map = await getBaseIdMap();
  const id = map.get(normalizeBaseName(baseName));

  if (!id) {
    const fallback = registryFallbackMap().get(normalizeBaseName(baseName));
    if (fallback) return fallback;

    throw new Error(
      `Airtable base "${baseName}" was not found. Verify the base name in lib/airtable/config/registry.ts and that your API key has access.`
    );
  }

  return id;
}

/** Resolve by registry key (name + optional fallback id). */
export async function resolveBaseIdByKey(key: AirtableBaseKey): Promise<string> {
  return resolveBaseId(AIRTABLE_BASES[key].name);
}

/** Convenience helper for the main SEO / content base. */
export async function resolveSeoBaseId(): Promise<string> {
  return resolveBaseIdByKey("seo");
}
