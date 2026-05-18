import { NextResponse } from "next/server";
import { CairrotAPIError } from "@/lib/cairrot/errors";
import { isCairrotConfigured } from "@/lib/env";

/** Dynamic import keeps API route bundles stable in Next.js 14. */
export async function getCairrotClientLazy() {
  const { getCairrotClient } = await import("@/lib/cairrot/client");
  return getCairrotClient();
}

export async function cairrotJsonRoute<T>(handler: () => Promise<T>) {
  if (!isCairrotConfigured()) {
    return NextResponse.json(
      { error: "Cairrot is not configured. Set CAIRROT_API_KEY and CAIRROT_PROJECT_ID in .env.local." },
      { status: 503 }
    );
  }

  try {
    const data = await handler();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof CairrotAPIError) {
      return NextResponse.json({ error: err.message, code: err.status }, { status: err.status });
    }
    console.error("Cairrot API route error");
    return NextResponse.json({ error: "Failed to fetch Cairrot data" }, { status: 500 });
  }
}
