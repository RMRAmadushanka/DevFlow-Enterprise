"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/components/forms/validation/validators";

const SEGMENT_COLOR = [
  "bg-danger",
  "bg-danger",
  "bg-warning",
  "bg-info",
  "bg-success",
] as const;

function PasswordStrengthMeter({ value }: { value: string }) {
  const strength = getPasswordStrength(value);

  const rules: { label: string; met: boolean }[] = [
    { label: "At least 8 characters", met: strength.checks.minLength },
    { label: "One uppercase letter", met: strength.checks.uppercase },
    { label: "One lowercase letter", met: strength.checks.lowercase },
    { label: "One number", met: strength.checks.number },
    { label: "One symbol", met: strength.checks.symbol },
  ];

  return (
    <div data-slot="password-strength-meter" className="flex flex-col gap-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((segment) => (
            <div
              key={segment}
              className={cn(
                "h-1 flex-1 rounded-full bg-muted transition-colors",
                value && segment <= strength.score && SEGMENT_COLOR[strength.score]
              )}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {value ? strength.label : ""}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              rule.met ? "text-success" : "text-muted-foreground"
            )}
          >
            {rule.met ? (
              <Check className="size-3 shrink-0" aria-hidden="true" />
            ) : (
              <X className="size-3 shrink-0 opacity-50" aria-hidden="true" />
            )}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PasswordStrengthMeter };
