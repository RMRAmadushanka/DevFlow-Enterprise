/**
 * Canonical create/edit form workflow (architecture contract).
 *
 * Button click
 *   → open modal / navigate to CRUD template (`useModal` or route)
 *   → validate with Zod + React Hook Form (`AppForm`)
 *   → call mutation hook (`useCreateX` / `useUpdateX`)
 *   → toast success / error (`toast` from feedback)
 *   → invalidate queries (`queryClient.invalidateQueries`)
 *
 * Rules:
 * - UI components never call `apiClient` or services directly
 * - Pages compose templates + feature hooks
 * - Services stay free of toasts and navigation
 */

export const FORM_WORKFLOW_STEPS = [
  "open",
  "validate",
  "mutate",
  "feedback",
  "invalidate",
] as const;

export type FormWorkflowStep = (typeof FORM_WORKFLOW_STEPS)[number];
