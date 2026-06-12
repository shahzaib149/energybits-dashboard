import { type NextRequest, NextResponse } from "next/server";
import { analyzeAdUrl } from "@/lib/gemini/client";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const adLink =
    typeof body === "object" && body !== null && "adLink" in body
      ? String((body as { adLink: unknown }).adLink ?? "").trim()
      : "";

  if (!adLink) {
    return NextResponse.json({ error: "adLink is required" }, { status: 400 });
  }

  try {
    const analysis = await analyzeAdUrl(adLink);
    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
