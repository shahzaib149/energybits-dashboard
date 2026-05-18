import { NextResponse } from "next/server";
import { READONLY_FIELDS } from "@/lib/editing";

export async function PATCH(req: Request) {
  const { tableId, recordId, fields } = await req.json();

  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(([key]) => !READONLY_FIELDS.includes(key))
  );

  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: safeFields })
    }
  );

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
