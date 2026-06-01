import { NextResponse } from "next/server";
import { AirtableAPIError } from "@/lib/airtable/errors";
import { isSEOAnalyticsConfigured } from "@/lib/seo-analytics/env";

export async function getAirtableClientLazy() {
  const { getAirtableClient } = await import("@/lib/airtable/client");
  return getAirtableClient();
}

export async function airtableJsonRoute<T>(handler: () => Promise<T>) {
  if (!isSEOAnalyticsConfigured()) {
    return NextResponse.json(
      { error: "SEO Analytics is not configured. Set AIRTABLE_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  try {
    const data = await handler();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AirtableAPIError) {
      return NextResponse.json({ error: err.message, code: err.status }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to fetch Airtable data" }, { status: 500 });
  }
}
