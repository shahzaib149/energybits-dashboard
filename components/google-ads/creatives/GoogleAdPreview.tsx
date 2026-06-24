"use client";

import { useState } from "react";
import { ExternalLink, ChevronLeft, ChevronRight, Play, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GoogleAdsPreviewRow } from "@/lib/google-ads/types";

// ─── YouTube embed ─────────────────────────────────────────────────────────────

function YouTubePreview({ videoId, adLink }: { videoId: string; adLink: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {!loaded && (
          <div
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3"
            onClick={() => setLoaded(true)}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt="Video thumbnail"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg">
              <Play className="h-7 w-7 fill-white text-white" />
            </div>
            <p className="relative z-10 text-xs font-medium text-white drop-shadow">Click to play</p>
          </div>
        )}
        {loaded && (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Ad video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-xs text-textMuted">
          <Play className="h-3 w-3" /> YouTube Video Ad
        </span>
        <div className="flex items-center gap-3">
          {adLink && (
            <a href={adLink} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
              Visit page <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-xs text-textMuted hover:underline">
            YouTube <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Image carousel ────────────────────────────────────────────────────────────

function ImagePreview({ urls, adName, adLink }: { urls: string[]; adName: string; adLink: string }) {
  const [current, setCurrent] = useState(0);
  const [errored, setErrored] = useState<Set<number>>(new Set());
  const valid = urls.filter((_, i) => !errored.has(i));
  if (valid.length === 0) return null;

  const single = valid.length === 1;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative flex min-h-[240px] items-center justify-center bg-black">
        <img
          key={valid[current]}
          src={valid[current]}
          alt={`${adName} — image ${current + 1}`}
          className="max-h-[420px] w-auto object-contain"
          onError={() => setErrored(prev => new Set([...prev, current]))}
        />
        {!single && (
          <>
            <button onClick={() => setCurrent(p => (p - 1 + valid.length) % valid.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setCurrent(p => (p + 1) % valid.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80">
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {valid.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={cn("h-1.5 rounded-full transition-all",
                    i === current ? "w-5 bg-white" : "w-1.5 bg-white/50")} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <span className="text-xs text-textMuted">
          {single ? "Image Ad" : `Image ${current + 1} of ${valid.length}`}
        </span>
        <div className="flex items-center gap-3">
          {adLink && (
            <a href={adLink} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
              Visit page <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a href={valid[current]} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-xs text-textMuted hover:underline">
            Open image <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {!single && (
        <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3">
          {valid.map((url, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn("h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                i === current ? "border-brand" : "border-transparent opacity-60 hover:opacity-100")}>
              <img src={url} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Text ad (RESPONSIVE_SEARCH_AD) mock Google search preview ────────────────

function TextAdPreview({ headlines, descriptions, adLink, ctaText }: {
  headlines: string[];
  descriptions: string[];
  adLink: string;
  ctaText: string;
}) {
  const displayUrl = adLink
    ? adLink.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "energybits.com";

  const title = headlines.slice(0, 3).join(" | ");
  const desc  = descriptions.slice(0, 2).join(" ");

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      {/* Mock Google search ad */}
      <div className="mb-4 rounded-lg border border-border bg-white p-4 shadow-sm dark:bg-surfaceElevated">
        {/* Sponsored label */}
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded border border-[#006621] px-1 py-px text-[10px] font-medium text-[#006621]">Ad</span>
          <span className="text-xs text-[#006621]">{displayUrl}</span>
        </div>
        {/* Headline */}
        <p className="text-base font-medium leading-snug text-[#1a0dab] dark:text-blue-400">
          {title || headlines[0] || "Google Ad"}
        </p>
        {/* Description */}
        {desc && (
          <p className="mt-1 text-sm text-[#545454] dark:text-textSecondary line-clamp-3">{desc}</p>
        )}
        {ctaText && (
          <span className="mt-2 inline-block rounded bg-[#1a73e8] px-3 py-1 text-xs font-medium text-white">
            {ctaText}
          </span>
        )}
      </div>

      {/* All headlines */}
      {headlines.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
            Headlines ({headlines.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {headlines.map((h, i) => (
              <span key={i} className="rounded-md border border-border bg-surfaceElevated px-2 py-1 text-xs text-textPrimary">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* All descriptions */}
      {descriptions.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
            Descriptions ({descriptions.length})
          </p>
          <div className="space-y-1">
            {descriptions.map((d, i) => (
              <p key={i} className="text-sm text-textPrimary">{d}</p>
            ))}
          </div>
        </div>
      )}

      {adLink && (
        <div className="mt-4">
          <a href={adLink} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
            <ExternalLink className="h-3 w-3" /> {adLink}
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function GoogleAdPreview({ preview, adName }: {
  preview: GoogleAdsPreviewRow | null;
  adName: string;
}) {
  if (!preview) return null;

  const isVideo   = Boolean(preview.youtubeId);
  const isImage   = preview.imageUrls.length > 0;
  const isTextAd  = Boolean(preview.adType?.includes("SEARCH") || preview.adType?.includes("RESPONSIVE_SEARCH"));
  const hasContent = isVideo || isImage || isTextAd || preview.headlines.length > 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Ad Preview</p>
        {preview.adType && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-textMuted">
            {preview.adType.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {isVideo && <YouTubePreview videoId={preview.youtubeId} adLink={preview.adLink} />}
      {!isVideo && isImage && <ImagePreview urls={preview.imageUrls} adName={adName} adLink={preview.adLink} />}
      {!isVideo && !isImage && (isTextAd || preview.headlines.length > 0) && (
        <TextAdPreview
          headlines={preview.headlines}
          descriptions={preview.descriptions}
          adLink={preview.adLink}
          ctaText={preview.ctaText}
        />
      )}
      {!hasContent && preview.adLink && (
        <a href={preview.adLink} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 rounded-lg border border-border bg-surfaceElevated px-4 py-2.5 text-sm font-medium text-brand hover:underline">
          <ExternalLink className="h-4 w-4" /> View Ad
        </a>
      )}
    </section>
  );
}
