import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { Tone } from "@/components/data-display/shared/types";
import type { StatusBadgeProps } from "./types";

const toneToVariant: Record<Tone, VariantProps<typeof badgeVariants>["variant"]> = {
  success: "success",
  warning: "warning",
  danger: "destructive",
  info: "info",
  neutral: "outline",
};

const sizeClassName: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "h-4.5 px-1.5 text-[0.6875rem]",
  md: "h-5 px-2 text-xs",
  lg: "h-6 px-2.5 text-sm",
};

/**
 * A semantic status label — e.g. "Production", "Completed", "Failed" —
 * wrapping the base `Badge` primitive with the system's five-tone palette,
 * an optional leading dot, and size variants. Prefer this over reaching for
 * `Badge` directly whenever the badge represents a state rather than a
 * static label (counts, "New", etc.).
 */
function StatusBadge({ tone = "neutral", children, icon, dot, size = "md", className }: StatusBadgeProps) {
  return (
    <Badge variant={toneToVariant[tone]} className={cn(sizeClassName[size], className)}>
      {icon ? (
        icon
      ) : dot ? (
        <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </Badge>
  );
}

export { StatusBadge };
