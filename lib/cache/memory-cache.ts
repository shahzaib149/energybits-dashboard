/**
 * In-memory TTL cache with concurrent request deduplication.
 * Prevents redundant external API calls (Airtable, Cairrot, etc.)
 * across tab switches, navigations, and concurrent renders.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = cacheStore.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  // Deduplicate concurrent in-flight requests for the exact same key
  const pending = inFlightRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    try {
      const result = await fetcher();
      cacheStore.set(key, {
        value: result,
        expiresAt: Date.now() + ttlSeconds * 1000
      });
      return result;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise as Promise<unknown>);
  return promise;
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}
