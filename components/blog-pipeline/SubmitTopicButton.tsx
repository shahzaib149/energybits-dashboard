"use client";

import { useState } from "react";
import { SubmitTopicModal } from "./SubmitTopicModal";
import { COPY } from "@/lib/copy";

export function SubmitTopicButton({ onSubmitted }: { onSubmitted?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brandHover"
      >
        {COPY.blogPipeline.submitCta}
      </button>

      {open && (
        <SubmitTopicModal
          onClose={() => setOpen(false)}
          onSubmitted={() => {
            setOpen(false);
            onSubmitted?.();
          }}
        />
      )}
    </>
  );
}
