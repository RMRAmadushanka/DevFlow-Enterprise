import { z } from "zod";

/**
 * Cross-field validation helpers — composed with `z.object({...}).superRefine()`
 * for rules that depend on more than one field (confirm-password,
 * conditional-required, date ranges). Each returns a `superRefine`
 * callback rather than a full schema so multiple rules can be combined:
 *
 * ```ts
 * const schema = z
 *   .object({ password: z.string(), confirmPassword: z.string() })
 *   .superRefine(matchesField("password", "confirmPassword"));
 * ```
 */

type SuperRefine<T> = (data: T, ctx: z.RefinementCtx) => void;

export function matchesField<T extends Record<string, unknown>>(
  field: keyof T & string,
  matchField: keyof T & string,
  message = "Fields do not match"
): SuperRefine<T> {
  return (data, ctx) => {
    if (data[field] !== data[matchField]) {
      ctx.addIssue({ code: "custom", message, path: [matchField] });
    }
  };
}

/** Requires `field` only when `condition(data)` is true — e.g. "company name" required only when accountType is "business". */
export function requireWhen<T>(
  condition: (data: T) => boolean,
  field: keyof T & string,
  message = "This field is required"
): SuperRefine<T> {
  return (data, ctx) => {
    const value = data[field];
    const isEmpty = value === undefined || value === null || value === "";
    if (condition(data) && isEmpty) {
      ctx.addIssue({ code: "custom", message, path: [field] });
    }
  };
}

/** Ensures a date range's start is not after its end. */
export function validDateRange<T>(
  startField: keyof T & string,
  endField: keyof T & string,
  message = "End date must be on or after the start date"
): SuperRefine<T> {
  return (data, ctx) => {
    const start = data[startField] as unknown as Date | null | undefined;
    const end = data[endField] as unknown as Date | null | undefined;
    if (start && end && start.getTime() > end.getTime()) {
      ctx.addIssue({ code: "custom", message, path: [endField] });
    }
  };
}

/** Ensures at least one of the given fields is filled — e.g. "email OR phone required". */
export function atLeastOneOf<T extends Record<string, unknown>>(
  fields: (keyof T & string)[],
  message = "Provide at least one of these fields"
): SuperRefine<T> {
  return (data, ctx) => {
    const filled = fields.some((field) => {
      const value = data[field];
      return value !== undefined && value !== null && value !== "";
    });
    if (!filled) {
      ctx.addIssue({ code: "custom", message, path: [fields[0]] });
    }
  };
}
