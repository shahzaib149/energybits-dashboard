"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import type { AeoPromptRecommendation, KeywordRecommendation } from "@/lib/blog-pipeline/submit-types";
import { matchRecommendationsForTopic } from "@/lib/blog-pipeline/match-recommendations";
import { COPY } from "@/lib/copy";

type Recommendations = {
  keywords: KeywordRecommendation[];
  aeoPrompts: AeoPromptRecommendation[];
};

export function SubmitTopicModal({
  open,
  onClose,
  onSubmitted
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: (recordId: string) => void;
}) {
  const copy = COPY.blogPipeline.submitModal;
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [matching, setMatching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recs, setRecs] = useState<Recommendations>({ keywords: [], aeoPrompts: [] });
  const [blogTitle, setBlogTitle] = useState("");
  const [keyword, setKeyword] = useState<KeywordRecommendation | null>(null);
  const [aeo, setAeo] = useState<AeoPromptRecommendation | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!open) {
      setBlogTitle("");
      setKeyword(null);
      setAeo(null);
      setShowSuggestions(false);
      setError("");
      setSubmitting(false);
      return;
    }

    setLoadingRecs(true);
    fetch("/api/blog-pipeline/recommendations")
      .then((r) => r.json())
      .then((data: Recommendations) => setRecs(data))
      .catch(() => setError(copy.loadRecsError))
      .finally(() => setLoadingRecs(false));
  }, [open, copy.loadRecsError]);

  useEffect(() => {
    const trimmed = blogTitle.trim();
    if (!trimmed || trimmed.length < 3 || loadingRecs) {
      setKeyword(null);
      setAeo(null);
      setShowSuggestions(false);
      return;
    }

    setMatching(true);
    const timer = window.setTimeout(() => {
      const matched = matchRecommendationsForTopic(trimmed, recs.keywords, recs.aeoPrompts);
      setKeyword(matched.keyword);
      setAeo(matched.aeoPrompt);
      setShowSuggestions(true);
      setMatching(false);
    }, 450);

    return () => {
      window.clearTimeout(timer);
      setMatching(false);
    };
  }, [blogTitle, recs, loadingRecs]);

  const canSubmit = useMemo(() => blogTitle.trim().length >= 3 && !matching && !loadingRecs, [
    blogTitle,
    matching,
    loadingRecs
  ]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = blogTitle.trim();
    if (!title) {
      setError(copy.titleRequired);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/blog-pipeline/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogTitle: title,
          keywordId: keyword?.id,
          aeoPromptId: aeo?.id
        })
      });
      const data = (await res.json()) as { record?: { id: string }; error?: string; webhookError?: string };
      if (!res.ok && res.status !== 207) {
        throw new Error(data.error || copy.submitFailed);
      }
      if (data.webhookError) {
        setError(`${copy.webhookWarning}: ${data.webhookError}`);
      }
      onSubmitted(data.record!.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.submitFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden />
      <form
        onSubmit={handleSubmit}
        className="fixed inset-x-3 top-[max(0.5rem,env(safe-area-inset-top))] z-50 mx-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-textMuted">{copy.eyebrow}</p>
            <h3 className="text-lg font-semibold text-textPrimary">{copy.title}</h3>
            <p className="mt-1 text-sm text-textSecondary">{copy.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-border p-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-textMuted">{copy.blogTitleLabel}</span>
            <input
              autoFocus
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              placeholder={copy.blogTitlePlaceholder}
              className="w-full rounded-lg border border-border bg-surfaceElevated px-3 py-2.5 text-sm text-textPrimary outline-none focus:border-brand"
            />
          </label>

          {loadingRecs ? (
            <div className="flex items-center gap-2 text-sm text-textSecondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              {copy.loadingRecs}
            </div>
          ) : null}

          {matching ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surfaceElevated px-3 py-2.5 text-sm text-textSecondary">
              <Sparkles className="h-4 w-4 text-brand" />
              {copy.matching}
            </div>
          ) : null}

          {showSuggestions && !matching && blogTitle.trim().length >= 3 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-textMuted">{copy.autoSuggestions}</p>

              {keyword ? (
                <div className="rounded-lg border border-brand/20 bg-brand/5 p-3">
                  <p className="text-xs font-medium text-brand">{copy.suggestedKeyword}</p>
                  <p className="mt-1 text-sm font-medium text-textPrimary">{keyword.keyword}</p>
                  <p className="mt-1 text-xs text-textSecondary">
                    {[keyword.searchIntent, keyword.primaryProduct, keyword.funnelStage]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-xs text-textMuted">
                  {copy.noKeywordMatch}
                </p>
              )}

              {aeo ? (
                <div className="rounded-lg border border-brand/20 bg-brand/5 p-3">
                  <p className="text-xs font-medium text-brand">{copy.suggestedPrompt}</p>
                  <p className="mt-1 text-sm text-textPrimary">{aeo.prompt}</p>
                  <p className="mt-1 text-xs text-textSecondary">
                    {[aeo.promptCategory, aeo.platform, aeo.buyerPersona].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-surfaceElevated px-3 py-2 text-xs text-textMuted">
                  {copy.noPromptMatch}
                </p>
              )}
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-textSecondary"
          >
            {COPY.blogPipeline.cancel}
          </button>
          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {copy.submitting}
              </>
            ) : (
              copy.submit
            )}
          </button>
        </div>
      </form>
    </>
  );
}
