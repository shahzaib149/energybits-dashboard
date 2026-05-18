"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

export function AddBlogTopicModal({
  open,
  onClose,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (topic: string) => Promise<void>;
}) {
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setTopic("");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError("Topic is required");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmed);
      setTopic("");
    } catch {
      setError("Could not save topic. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/40"
        onClick={onClose}
        aria-hidden
      />
      <form
        onSubmit={handleSubmit}
        className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-50 mx-auto flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Blog pipeline</p>
            <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Add a topic</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Topic <span className="text-red-500">*</span>
            </span>
            <input
              autoFocus
              type="text"
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              placeholder="e.g. Spirulina benefits for endurance athletes"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-slate-400 ${
                error ? "border-red-300" : "border-slate-200"
              }`}
            />
            {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
            <p className="mt-2 text-xs text-slate-500">Saved to Airtable as the blog title for a new pipeline row.</p>
          </label>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Add topic"}
          </button>
        </div>
      </form>
    </>
  );
}
