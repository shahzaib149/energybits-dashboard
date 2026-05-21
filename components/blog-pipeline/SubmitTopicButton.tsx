"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { BlogPipelineRow } from "@/lib/airtable/blog-pipeline";
import { SubmitTopicModal } from "@/components/blog-pipeline/SubmitTopicModal";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function SubmitTopicButton({
  className,
  onSubmitted
}: {
  className?: string;
  onSubmitted?: (row: BlogPipelineRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const copy = COPY.blogPipeline;

  function handleSubmitted(row: BlogPipelineRow) {
    toast.success(copy.submitModal.success);
    onSubmitted?.(row);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex rounded-lg bg-brand/15 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/25",
          className
        )}
      >
        {copy.submitCta}
      </button>
      <SubmitTopicModal open={open} onClose={() => setOpen(false)} onSubmitted={handleSubmitted} />
    </>
  );
}
