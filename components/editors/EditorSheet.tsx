"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

export function EditorSheet({
  open,
  title,
  onClose,
  children,
  footer
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-5 shadow-2xl md:inset-0 md:m-auto md:h-fit md:max-w-2xl md:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </>
  );
}
