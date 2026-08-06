import { create } from "zustand";

/**
 * Cross-application Zustand store tracking which registered forms
 * currently have unsaved changes. `AppForm`/`useAppForm` register into it
 * automatically when given a `formId` — nothing else needs to reach into
 * React Hook Form's internal state to answer "does the user have unsaved
 * work anywhere?" (e.g. for a global "leave without saving?" guard, or a
 * navbar indicator).
 */
interface FormDirtyState {
  dirtyForms: Record<string, boolean>;
  setFormDirty: (formId: string, dirty: boolean) => void;
  clearForm: (formId: string) => void;
  reset: () => void;
}

export const useFormDirtyStore = create<FormDirtyState>((set) => ({
  dirtyForms: {},
  setFormDirty: (formId, dirty) =>
    set((state) => ({ dirtyForms: { ...state.dirtyForms, [formId]: dirty } })),
  clearForm: (formId) =>
    set((state) => {
      const next = { ...state.dirtyForms };
      delete next[formId];
      return { dirtyForms: next };
    }),
  reset: () => set({ dirtyForms: {} }),
}));

/** True if *any* registered form currently has unsaved changes. */
export function useHasUnsavedChanges(): boolean {
  return useFormDirtyStore((state) => Object.values(state.dirtyForms).some(Boolean));
}
