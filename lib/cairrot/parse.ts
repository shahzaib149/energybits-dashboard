import type { DocsBundle } from "@/lib/cairrot/types";

/** Cairrot returns `{ ok, data }` in OpenAPI and `{ status: "success", data }` in production. */
export function isApiSuccess(body: unknown): body is { data: unknown } {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const record = body as Record<string, unknown>;
  if (record.ok === true) {
    return true;
  }
  return record.status === "success";
}

export function unwrapApiData<T>(body: unknown): T {
  if (!isApiSuccess(body)) {
    throw new Error("Invalid Cairrot API response envelope");
  }
  return (body as { data: T }).data;
}

export function unwrapDocsBundle<T>(body: unknown): DocsBundle<T> {
  const data = unwrapApiData<DocsBundle<T> | { docs?: T[]; items?: T[] }>(body);
  if ("docs" in data && Array.isArray(data.docs)) {
    return data as DocsBundle<T>;
  }
  return {
    hasNextPage: false,
    hasPrevPage: false,
    totalPages: 1,
    totalDocs: 0,
    docs: []
  };
}
