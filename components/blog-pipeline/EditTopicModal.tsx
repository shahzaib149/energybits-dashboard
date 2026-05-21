"use client";

import { FormEvent, useState, useTransition } from "react";
import type { BlogPipelineRow } from "@/lib/airtable/blog-pipeline";
import { COPY } from "@/lib/copy";

const FUNNEL_STAGES = ["Awareness", "Consideration", "Decision", "Retention"];
const PRODUCTS = [
  "Spirulina",
  "Chlorella",
  "Bits",
  "RECOMMEND Bits",
  "Other"
];

export function EditTopicModal({
  row,
  onClose,
  onSaved
}: {
  row: BlogPipelineRow;
  onClose: () => void;
  onSaved: (row: BlogPipelineRow) => void;
}) {
  const copy = COPY.blogPipeline;
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    "Blog Title": row.blogTitle,
    "Suggested Blog Title": row.suggestedBlogTitle,
    "Target Keyword": row.targetKeyword,
    "AEO Question": row.aeoQuestion,
    "Funnel Stage": row.funnelStage,
    "Primary Product": row.primaryProduct,
    Notes: row.notes
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch(`/api/blog-pipeline/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as { record: BlogPipelineRow };
        onSaved(data.record);
      } catch {
        // toast handled by parent
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-textPrimary">{copy.editTopic}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {(
            [
              ["Blog Title", "text"],
              ["Suggested Blog Title", "textarea"],
              ["Target Keyword", "text"],
              ["AEO Question", "textarea"],
              ["Notes", "textarea"]
            ] as const
          ).map(([field, type]) => (
            <div key={field}>
              <label className="text-xs font-medium text-textMuted">{field}</label>
              {type === "textarea" ? (
                <textarea
                  className="mt-1 w-full rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm text-textPrimary"
                  rows={3}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              ) : (
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm text-textPrimary"
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-textMuted">Funnel Stage</label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm text-textPrimary"
              value={form["Funnel Stage"]}
              onChange={(e) => setForm((f) => ({ ...f, "Funnel Stage": e.target.value }))}
            >
              <option value="">—</option>
              {FUNNEL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-textMuted">Primary Product</label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm text-textPrimary"
              value={form["Primary Product"]}
              onChange={(e) => setForm((f) => ({ ...f, "Primary Product": e.target.value }))}
            >
              <option value="">—</option>
              {PRODUCTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-textSecondary hover:bg-surfaceElevated"
            >
              {copy.cancel}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brandHover disabled:opacity-50"
            >
              {copy.saveTopic}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
