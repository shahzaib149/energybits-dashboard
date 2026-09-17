import type { SEOTrackingRow } from "@/lib/airtable/types";

/**
 * Generates a unique deduplication signature for an SEO tracking row.
 * Handles both fully mapped rows (with query/SEO Key) and degraded rows
 * where Make.com failed to map the query text (August-September 2026).
 */
export function getSEORowDeduplicationKey(row: SEOTrackingRow): string {
  const period = row.endDate || "unknown";
  const rawKey = row.seoKey?.trim();
  const query = row.query?.trim();
  const pageUrl = row.pageUrl?.trim();
  const country = row.country?.trim() || "";

  // Check if query is just the generic fallback from map.ts ("energy bits" when query and SEO Key were blank)
  const isFallbackQuery =
    query === "energy bits" &&
    pageUrl === "https://energybits.com/" &&
    (!rawKey || rawKey === "energy bits");

  if ((rawKey || (query && pageUrl)) && !isFallbackQuery) {
    const identifier = rawKey || `${query}|${pageUrl}|${country}`;
    return `key:${period}|${identifier}`;
  }

  // Fallback for periods where Make.com did not populate Query/SEO Key:
  // Deduplicate by period, metric signature, and recommended action text.
  return `metric:${period}|c:${row.clicks}|i:${row.impressions}|p:${row.averagePosition}|ctr:${row.ctrPct}|a:${row.recommendedAction?.trim()}`;
}

/**
 * Removes duplicate SEO rows within each sync period caused by Make.com re-syncs.
 * Preserves the row with the most complete metadata.
 */
export function deduplicateSEORows(rows: SEOTrackingRow[]): SEOTrackingRow[] {
  if (rows.length <= 1) return rows;

  const seen = new Map<string, SEOTrackingRow>();

  for (const row of rows) {
    const key = getSEORowDeduplicationKey(row);
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, row);
      continue;
    }

    // If duplicate found, keep the one with higher signals or better query data
    const existingHasQuery = Boolean(existing.query && existing.query !== "energy bits");
    const currentHasQuery = Boolean(row.query && row.query !== "energy bits");

    if (!existingHasQuery && currentHasQuery) {
      seen.set(key, row);
    } else if (row.impressions > existing.impressions) {
      seen.set(key, row);
    }
  }

  return Array.from(seen.values());
}
