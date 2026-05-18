import { NextResponse } from "next/server";
import { READONLY_FIELDS } from "@/lib/editing";

export async function POST(req: Request) {
  const { tableId, fields } = await req.json();

  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(([key, value]) => !READONLY_FIELDS.includes(key) && value !== "" && value !== undefined)
  );

  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: safeFields })
    }
  );

  if (!res.ok) {
    const error = await res.json();

    // Extract more specific error information
    let errorMessage = "Failed to create record";
    if (error.error?.type === "INVALID_VALUE_FOR_COLUMN") {
      errorMessage = "Invalid field value provided";
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return NextResponse.json({
      error: errorMessage,
      details: error.error,
      fields: safeFields
    }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
