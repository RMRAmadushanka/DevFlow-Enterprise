"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, OctagonX, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AlertBannerProps } from "./types";

const toneToVariant = {
  success: "success",
  error: "destructive",
  warning: "warning",
  info: "info",
  neutral: "default",
} as const;

const defaultIcons = {
  success: CheckCircle2,
  error: OctagonX,
  warning: AlertTriangle,
  info: Info,
  neutral: Info,
} as const;

/**
 * Opinionated alert banner with tone icons, optional action, and dismiss.
 * Wraps the ui `Alert` primitive — prefer this for product callouts.
 */
function AlertBanner({
  title,
  description,
  tone = "info",
  icon,
  action,
  dismissible,
  onDismiss,
  className,
}: AlertBannerProps) {
  const Icon = defaultIcons[tone];

  return (
    <Alert variant={toneToVariant[tone]} className={cn(className)}>
      {icon ?? <Icon aria-hidden="true" />}
      <AlertTitle>{title}</AlertTitle>
      {description ? <AlertDescription>{description}</AlertDescription> : null}
      {action || dismissible ? (
        <AlertAction className="flex items-center gap-1">
          {action}
          {dismissible ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Dismiss"
              onClick={onDismiss}
            >
              <X />
            </Button>
          ) : null}
        </AlertAction>
      ) : null}
    </Alert>
  );
}

export { AlertBanner };
