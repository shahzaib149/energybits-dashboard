"use client";

import { PencilLine } from "lucide-react";
import { useEditMode } from "@/hooks/useEditMode";

export function EditModeToggle() {
  const { isEditMode, setIsEditMode } = useEditMode();

  return (
    <button
      type="button"
      onClick={() => setIsEditMode(!isEditMode)}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
        isEditMode
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      <PencilLine className="h-4 w-4" />
      Edit Mode {isEditMode ? "On" : "Off"}
    </button>
  );
}
