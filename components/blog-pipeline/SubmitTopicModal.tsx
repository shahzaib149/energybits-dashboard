"use client";

import { useState } from "react";
import { COPY } from "@/lib/copy";

type Step = "form" | "submitting" | "success" | "error";

interface Props {
  onClose: () => void;
  onSubmitted?: () => void;
}

export function SubmitTopicModal({ onClose, onSubmitted }: Props) {
  const copy = COPY.blogPipeline.submitModal;
  const [blogTitle, setBlogTitle] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [resultMessage, setResultMessage] = useState("");

  const isSubmitting = step === "submitting";
  const canSubmit = step === "form" && blogTitle.trim().length > 3;

  async function handleSubmit() {
    if (!canSubmit) return;
    setStep("submitting");
    try {
      const res = await fetch("/api/blog-pipeline/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogTitle: blogTitle.trim() })
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setResultMessage(data.error ?? copy.errorGeneric);
        setStep("error");
        return;
      }
      setResultMessage(copy.successMessage);
      setStep("success");
      onSubmitted?.();
    } catch {
      setResultMessage(copy.errorGeneric);
      setStep("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-textPrimary">{copy.title}</h2>
            <p className="mt-0.5 text-sm text-textSecondary">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-textMuted hover:bg-surfaceElevated hover:text-textSecondary"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {step === "success" || step === "error" ? (
          <div className="mt-6 space-y-4">
            <div
              className={`rounded-lg border p-4 text-sm ${
                step === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {resultMessage}
            </div>
            <div className="flex justify-end gap-2">
              {step === "error" && (
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-textSecondary hover:bg-surfaceElevated"
                >
                  {copy.tryAgain}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brandHover"
              >
                {copy.done}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div>
              <label className="text-xs font-medium text-textMuted">{copy.titleLabel}</label>
              <input
                autoFocus
                type="text"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleSubmit(); }}
                placeholder={copy.titlePlaceholder}
                className="mt-1 w-full rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-brand focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-textMuted">{copy.autoHint}</p>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm text-textSecondary hover:bg-surfaceElevated"
              >
                {COPY.blogPipeline.cancel}
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || isSubmitting}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brandHover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? copy.submitting : copy.submit}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
