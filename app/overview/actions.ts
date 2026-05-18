"use server";

import { revalidateTag } from "next/cache";

export async function refreshCairrotData(runId?: string) {
  revalidateTag("cairrot");
  if (runId) {
    revalidateTag(`run-${runId}`);
  }
}
