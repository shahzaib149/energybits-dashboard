"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import type { ActionItem } from "@/lib/overview/action-types";
import { COPY } from "@/lib/copy";

export function ActionMarkHandled({ action }: { action: ActionItem }) {
  const [pending, startTransition] = useTransition();
  const copy = COPY.overview.topActions;

  function handleClick() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/overview/actions/dismiss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionKey: action.actionKey,
            source: action.source.startsWith("google-ads") ? "ads" : action.source,
            recordId: action.recordId,
            metadata: { headline: action.headline }
          })
        });
        if (!res.ok) throw new Error("Failed");
        toast.success("Marked as handled");
        window.location.reload();
      } catch {
        toast.error("Could not update. Try again.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      title={copy.markHandledTooltip}
      className="rounded-lg bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/25 disabled:opacity-50"
    >
      {copy.markHandled}
    </button>
  );
}
