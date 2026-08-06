"use client";

import * as React from "react";
import { AlertTriangle, Lock, WifiOff, Bug } from "lucide-react";

import { EmptyState } from "@/components/data-display/empty-state";
import type { ErrorStateProps, ErrorStateVariant } from "./types";

const defaults: Record<
  ErrorStateVariant,
  { icon: React.ReactNode; title: string; description: string }
> = {
  page: {
    icon: <AlertTriangle />,
    title: "Something went wrong",
    description: "Please try again, or contact support if the problem persists.",
  },
  component: {
    icon: <Bug />,
    title: "This section failed to load",
    description: "Try refreshing, or continue with the rest of the page.",
  },
  network: {
    icon: <WifiOff />,
    title: "Connection problem",
    description: "Check your network and try again.",
  },
  permission: {
    icon: <Lock />,
    title: "You don't have access",
    description: "Contact an admin if you think this is a mistake.",
  },
};

/**
 * Error empty state with page/component/network/permission variants.
 */
function ErrorState({
  variant = "page",
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  const preset = defaults[variant];

  return (
    <EmptyState
      variant="error"
      icon={preset.icon}
      title={title ?? preset.title}
      description={description ?? preset.description}
      action={action}
      className={className}
    />
  );
}

export { ErrorState };
