"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { BlogPipelineRow } from "@/lib/airtable/blog-pipeline";
import { COPY } from "@/lib/copy";
import { EditTopicModal } from "@/components/blog-pipeline/EditTopicModal";

export function TopicActions({
  row,
  canEdit,
  onDeleted,
  onUpdated
}: {
  row: BlogPipelineRow;
  canEdit: boolean;
  onDeleted: (id: string) => void;
  onUpdated: (row: BlogPipelineRow) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const copy = COPY.blogPipeline;
  const isReady = row.blogStatus === "Ready";

  if (!canEdit || !isReady) return null;

  function handleDelete() {
    const msg = copy.deleteConfirm.replace("{title}", row.blogTitle || "this topic");
    if (!window.confirm(msg)) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/blog-pipeline/${row.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
        toast.success(copy.topicDeleted);
        onDeleted(row.id);
      } catch {
        toast.error("Could not delete topic");
      }
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          title={copy.editTooltip}
          onClick={() => setEditOpen(true)}
          className="text-xs font-medium text-brand hover:text-brandHover"
        >
          {copy.editTopic}
        </button>
        <button
          type="button"
          disabled={pending}
          title={copy.deleteTooltip}
          onClick={handleDelete}
          className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {copy.deleteTopic}
        </button>
      </div>
      {editOpen ? (
        <EditTopicModal
          row={row}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setEditOpen(false);
            onUpdated(updated);
            toast.success(copy.topicUpdated);
          }}
        />
      ) : null}
    </>
  );
}
