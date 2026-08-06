"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Inbox, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StatusMessageProps } from "./types";

const config = {
  loading: {
    icon: Loader2,
    iconClass: "animate-spin text-muted-foreground",
    defaultTitle: "Loading…",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-success",
    defaultTitle: "Success",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    defaultTitle: "Something went wrong",
  },
  empty: {
    icon: Inbox,
    iconClass: "text-muted-foreground",
    defaultTitle: "Nothing here",
  },
} as const;

/**
 * Compact inline status for forms, tables, and cards — loading/success/
 * error/empty without the weight of a full EmptyState or Alert.
 */
function StatusMessage({ variant, title, description, className }: StatusMessageProps) {
  const { icon: Icon, iconClass, defaultTitle } = config[variant];

  return (
    <div
      data-slot="status-message"
      data-variant={variant}
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 text-sm", className)}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconClass)} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-medium text-foreground">{title ?? defaultTitle}</p>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

export { StatusMessage };
