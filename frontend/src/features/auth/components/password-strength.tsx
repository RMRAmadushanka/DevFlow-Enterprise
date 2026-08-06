"use client";

import { PasswordStrengthMeter } from "@/components/forms/password";

export interface PasswordStrengthProps {
  value: string;
}

/** Feature alias around the design-system password strength meter. */
function PasswordStrength({ value }: PasswordStrengthProps) {
  return <PasswordStrengthMeter value={value} />;
}

export { PasswordStrength };
