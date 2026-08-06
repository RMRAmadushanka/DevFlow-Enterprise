"use client";

import * as React from "react";

export type AsyncValidationStatus = "idle" | "validating" | "valid" | "invalid";

export interface UseAsyncValidationResult {
  status: AsyncValidationStatus;
  message: string | null;
}

/**
 * Debounced async validation for things a Zod `.refine()` can't check
 * synchronously — username/slug availability, domain verification, etc.
 * Wire the returned `status`/`message` into a field's `successText`/`error`.
 *
 * @example
 * const { status, message } = useAsyncValidation(username, {
 *   validate: (value) => api.checkUsernameAvailable(value),
 *   validMessage: "Username is available",
 *   invalidMessage: "Username is already taken",
 * });
 */
export function useAsyncValidation(
  value: string,
  options: {
    validate: (value: string) => Promise<boolean>;
    validMessage?: string;
    invalidMessage?: string;
    debounceMs?: number;
    minLength?: number;
  }
): UseAsyncValidationResult {
  const {
    validate,
    validMessage = "Looks good",
    invalidMessage = "This value isn't available",
    debounceMs = 400,
    minLength = 1,
  } = options;

  const [status, setStatus] = React.useState<AsyncValidationStatus>("idle");
  const requestIdRef = React.useRef(0);

  React.useEffect(() => {
    if (value.trim().length < minLength) {
      setStatus("idle");
      return;
    }

    const requestId = ++requestIdRef.current;
    setStatus("validating");

    const timeout = setTimeout(async () => {
      try {
        const isValid = await validate(value);
        if (requestIdRef.current === requestId) {
          setStatus(isValid ? "valid" : "invalid");
        }
      } catch {
        if (requestIdRef.current === requestId) setStatus("idle");
      }
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [value, validate, debounceMs, minLength]);

  const message =
    status === "valid" ? validMessage : status === "invalid" ? invalidMessage : null;

  return { status, message };
}

/**
 * Wraps an async check into a Zod-compatible `.refine()` callback with
 * built-in debouncing, for schemas that need server-side validation on
 * submit (as opposed to the live `useAsyncValidation` hook above).
 */
export function createAsyncValidator<T>(
  validate: (value: T) => Promise<boolean>,
  debounceMs = 250
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (value: T): Promise<boolean> =>
    new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        validate(value).then(resolve).catch(() => resolve(false));
      }, debounceMs);
    });
}
