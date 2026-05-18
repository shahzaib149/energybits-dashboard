"use client";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function PageError({ error, reset }: PageErrorProps) {
  return (
    <div className="card mx-auto max-w-2xl p-8 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-rose-500">Data Error</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">The page could not load Airtable data</h2>
      <p className="mt-3 text-sm text-slate-500">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
