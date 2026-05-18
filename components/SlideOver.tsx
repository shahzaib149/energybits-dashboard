"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface SlideOverProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function SlideOver({ open, title, subtitle, onClose, children }: SlideOverProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 sm:max-w-2xl ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Record Details</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </>
  );
}
