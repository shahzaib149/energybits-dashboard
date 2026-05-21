"use client";

import { useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { COPY } from "@/lib/copy";

export function BlogPublishButton({
  recordId,
  blogTitle,
  canPublish
}: {
  recordId: string;
  blogTitle: string;
  canPublish: boolean;
}) {
  const copy = COPY.blogPipeline.publish;
  const [pending, startTransition] = useTransition();
  const [published, setPublished] = useState(false);

  if (!canPublish) return null;

  function handlePublish() {
    const msg = copy.confirm.replace("{title}", blogTitle || "this blog");
    if (!window.confirm(msg)) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/blog-pipeline/${recordId}/publish`, {
          method: "POST"
        });
        const data = (await res.json()) as { error?: string; ok?: boolean };
        if (!res.ok) {
          throw new Error(data.error || copy.failed);
        }
        setPublished(true);
        toast.success(copy.success);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : copy.failed);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handlePublish}
      disabled={pending || published}
      title={copy.tooltip}
      className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brandHover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      {pending ? copy.publishing : published ? copy.published : copy.button}
    </button>
  );
}
