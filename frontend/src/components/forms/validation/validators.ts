/**
 * Standalone validator/scoring functions usable outside Zod too — e.g. for
 * live UI feedback (`PasswordInput`'s strength meter) where you want a
 * score, not just a pass/fail parse result.
 */

export type PasswordStrengthLabel = "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";

export interface PasswordStrength {
  /** 0–4. */
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrengthLabel;
  /** Which rules the password currently satisfies — drive checklist UI with this. */
  checks: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

const STRENGTH_LABELS: PasswordStrengthLabel[] = [
  "Very weak",
  "Weak",
  "Fair",
  "Strong",
  "Very strong",
];

export function getPasswordStrength(value: string): PasswordStrength {
  const checks = {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = (value.length === 0 ? 0 : Math.min(4, Math.max(passed - 1, 0))) as 0 | 1 | 2 | 3 | 4;

  return { score, label: STRENGTH_LABELS[score], checks };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

/** Loose E.164 check — `+` followed by 8–15 digits. */
export function isValidE164Phone(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function isValidOtp(value: string, length: number): boolean {
  return new RegExp(`^\\d{${length}}$`).test(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
