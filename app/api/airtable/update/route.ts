import { NextResponse } from "next/server";
import { READONLY_FIELDS } from "@/lib/editing";
import { getAirtableApiKey } from "@/lib/airtable/config/env";
import { seoTableRecordUrl } from "@/lib/airtable";

export async function PATCH(req: Request) {
  const { tableId, recordId, fields } = await req.json();

  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(([key]) => !READONLY_FIELDS.includes(key))
  );

  const url = await seoTableRecordUrl(tableId, recordId);
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getAirtableApiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: safeFields })
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
