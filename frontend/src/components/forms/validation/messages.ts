import type { FieldError } from "react-hook-form";

/**
 * Centralized fallback copy + a single `getErrorMessage` extractor so every
 * field reads React Hook Form's `fieldState.error` the same way, instead of
 * each of the 300+ fields re-deriving `error?.message ?? "..."` by hand.
 */
export const defaultValidationMessages = {
  required: "This field is required",
  invalid: "This value isn't valid",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be ${max} characters or fewer`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be ${max} or less`,
  email: "Enter a valid email address",
  url: "Enter a valid URL",
  pattern: "This value is in the wrong format",
  fileTooLarge: (maxMb: number) => `File must be smaller than ${maxMb}MB`,
  fileType: "This file type isn't supported",
  generic: "Something went wrong. Please try again.",
} as const;

/** Safely extracts a display-ready string from a React Hook Form `FieldError` (which may be `undefined`). */
export function getErrorMessage(error: FieldError | undefined): string | undefined {
  if (!error) return undefined;
  if (typeof error.message === "string" && error.message.length > 0) return error.message;
  return defaultValidationMessages.invalid;
}
