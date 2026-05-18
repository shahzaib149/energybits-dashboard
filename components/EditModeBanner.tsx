"use client";

import { useEditMode } from "@/hooks/useEditMode";

export function EditModeBanner() {
  const { isEditMode, ready } = useEditMode();

  if (!ready || !isEditMode) {
    return null;
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
      Edit Mode Active — changes sync directly to Airtable
    </div>
  );
}
