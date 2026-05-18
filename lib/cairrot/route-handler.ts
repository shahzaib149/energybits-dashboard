import { NextResponse } from "next/server";
import { getCairrotClient } from "@/lib/cairrot/client";
import { CairrotAPIError } from "@/lib/cairrot/errors";
import { isCairrotConfigured } from "@/lib/env";

export const CAIRROT_ROUTE_REVALIDATE = 300;

export async function handleCairrotRoute<T>(handler: () => Promise<T>) {
  if (!isCairrotConfigured()) {
    return NextResponse.json(
      { error: "Cairrot is not configured. Set CAIRROT_* variables in .env.local." },
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
    console.error("Cairrot route failed");
    return NextResponse.json({ error: "Failed to fetch Cairrot data" }, { status: 500 });
  }
}

export function getClient() {
  return getCairrotClient();
}
