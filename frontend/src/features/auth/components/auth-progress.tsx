"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AuthProgressProps {
  label?: string;
  className?: string;
}

/**
 * Minimal auth wait state — spinner only, for brief redirect/callback gaps.
 */
function AuthProgress({ label = "Signing in", className }: AuthProgressProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full items-center justify-center bg-background",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { AuthProgress };
