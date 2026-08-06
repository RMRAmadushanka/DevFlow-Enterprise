import { z } from "zod";

/**
 * Reusable Zod building blocks for the 100+ forms this system needs to
 * support. Compose these into feature schemas instead of re-writing the
 * same `.min()`/`.regex()` chains — e.g.:
 *
 * ```ts
 * const schema = z.object({
 *   email: emailSchema,
 *   password: strongPasswordSchema,
 *   website: urlSchema.optional(),
 * });
 * ```
 */

export const requiredString = (message = "This field is required") =>
  z.string().trim().min(1, message);

export const optionalString = () => z.string().trim().optional().or(z.literal(""));

export const emailSchema = z.email("Enter a valid email address");

export const urlSchema = z.url("Enter a valid URL");

/** Loose E.164-style check (`+` followed by 8–15 digits) — pair with `PhoneInput`, which already constrains keystrokes. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Enter a valid phone number with country code");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Must be at least 3 characters")
  .max(24, "Must be 24 characters or fewer")
  .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores allowed");

export interface PasswordSchemaOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSymbol?: boolean;
}

/** Factory so different forms (e.g. "set PIN" vs. "set account password") can tune requirements. */
export function passwordSchema(options: PasswordSchemaOptions = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSymbol = true,
  } = options;

  let schema = z.string().min(minLength, `Must be at least ${minLength} characters`);
  if (requireUppercase) schema = schema.regex(/[A-Z]/, "Must contain an uppercase letter");
  if (requireLowercase) schema = schema.regex(/[a-z]/, "Must contain a lowercase letter");
  if (requireNumber) schema = schema.regex(/\d/, "Must contain a number");
  if (requireSymbol) schema = schema.regex(/[^A-Za-z0-9]/, "Must contain a symbol");
  return schema;
}

export const strongPasswordSchema = passwordSchema();

export const otpSchema = (length = 6) =>
  z
    .string()
    .length(length, `Enter all ${length} digits`)
    .regex(/^\d+$/, "Code must be numeric");

export const percentageSchema = z
  .number()
  .min(0, "Must be at least 0%")
  .max(100, "Must be 100% or less");

export const hexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a valid hex color, e.g. #4F46E5");

export const dateSchema = z.coerce.date({ error: "Enter a valid date" });

export const tagsSchema = (maxTags = 20) =>
  z.array(z.string().trim().min(1)).max(maxTags, `You can add up to ${maxTags} tags`);

export interface FileSchemaOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  /** Human-readable label used in error messages, e.g. "image". @default "file" */
  label?: string;
}

/** Validates a single browser `File`. Combine with `z.array(...)` for multi-file uploads. */
export function fileSchema(options: FileSchemaOptions = {}) {
  const { maxSizeBytes, allowedTypes, label = "file" } = options;

  return z
    .instanceof(File, { error: `Please choose a ${label}` })
    .refine((file) => !maxSizeBytes || file.size <= maxSizeBytes, {
      message: maxSizeBytes
        ? `File must be smaller than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
        : "File is too large",
    })
    .refine(
      (file) =>
        !allowedTypes ||
        allowedTypes.some((type) =>
          type.endsWith("/*") ? file.type.startsWith(type.replace("/*", "/")) : file.type === type
        ),
      { message: `Unsupported ${label} type` }
    );
}

export const currencyAmountSchema = z
  .number({ error: "Enter a valid amount" })
  .finite()
  .refine((value) => Number(value.toFixed(2)) === value, "Enter at most 2 decimal places");
