/**
 * Shared, cross-cutting types used by every form field in the Enterprise
 * Form System. Field-specific prop interfaces live in each field's own
 * `types.ts` and extend these where relevant.
 */
import type * as React from "react";

/** Visual density — every input-like control supports these three sizes. */
export type FieldSize = "sm" | "md" | "lg";

/**
 * The semantic validation state a field is currently in. Distinct from
 * `disabled`/`loading`, which are interaction states, not validation
 * results. Wire this from React Hook Form's `fieldState`, not by hand.
 */
export type ValidationState = "default" | "error" | "success" | "warning";

/**
 * The common prop surface shared by (almost) every field in the system.
 * Individual fields extend this with their own `value`/`onChange` shape
 * (checkbox's `boolean` vs. text input's `string`, for example) since a
 * single generic `value`/`onChange` pair can't be typed precisely enough
 * across such different control types.
 */
export interface BaseFieldProps {
  /** Visible label rendered above the control. */
  label?: React.ReactNode;
  /** Marks the field as required and renders `FormRequiredIndicator`. */
  required?: boolean;
  /** Disables the control and dims its chrome. */
  disabled?: boolean;
  /** Shows a loading affordance and disables interaction. */
  loading?: boolean;
  /** Validation/help message shown below the control. */
  error?: string;
  /** Non-error helper copy shown below the control when there's no error. */
  helperText?: React.ReactNode;
  /** Success copy shown below the control (e.g. after async validation passes). */
  successText?: React.ReactNode;
  /** Explicit validation state override — inferred from `error`/`successText` when omitted. */
  validationState?: ValidationState;
  /** Visual size. @default "md" */
  size?: FieldSize;
  /** Additional class names for the outer field wrapper. */
  className?: string;
  /** `id` for the control — auto-generated via `useId()` when omitted. */
  id?: string;
  /** Element `name`, used by native forms and React Hook Form's `register`. */
  name?: string;
}

/** Standard shape for components exposing an imperative focus handle. */
export interface FieldImperativeHandle {
  focus: () => void;
  blur: () => void;
}
