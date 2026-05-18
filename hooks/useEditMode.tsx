"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

interface EditModeContextValue {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  ready: boolean;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

/** Editing is always enabled; toggle removed from UI. */
export function EditModeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      isEditMode: true,
      setIsEditMode: () => {},
      ready: true
    }),
    []
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

export function useEditMode() {
  const context = useContext(EditModeContext);

  if (!context) {
    throw new Error("useEditMode must be used within an EditModeProvider.");
  }

  return context;
}
