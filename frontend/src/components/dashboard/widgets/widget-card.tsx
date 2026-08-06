"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/data-display/loading";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { WidgetError } from "./widget-error";
import type { WidgetCardProps } from "./types";

/**
 * Base container for dashboard widgets — header, content, footer, plus
 * loading / empty / error chrome.
 */
function WidgetCard({
  title,
  description,
  icon,
  actions,
  footer,
  children,
  loading,
  empty,
  error,
  emptyState,
  onRetry,
  label,
  className,
  contentClassName,
}: WidgetCardProps) {
  const accessibleName =
    label ?? (typeof title === "string" ? title : "Dashboard widget");

  let body: React.ReactNode = children;

  if (loading) {
    body = (
      <div className="flex min-h-28 items-center justify-center py-8" aria-busy="true">
        <Spinner size="md" label={`Loading ${accessibleName}`} />
      </div>
    );
  } else if (error) {
    body =
      typeof error === "string" || error === true ? (
        <WidgetError
          title={typeof error === "string" ? error : undefined}
          onRetry={onRetry}
        />
      ) : (
        error
      );
  } else if (empty) {
    body = emptyState ?? <DashboardEmptyState />;
  }

  return (
    <Card
      data-slot="widget-card"
      data-state={loading ? "loading" : error ? "error" : empty ? "empty" : "default"}
      aria-label={accessibleName}
      className={cn("h-full", className)}
    >
      {title || description || icon || actions ? (
        <CardHeader className="border-b pb-(--card-spacing)">
          <div className="flex min-w-0 items-start gap-2">
            {icon ? (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary [&>svg]:size-4">
                {icon}
              </div>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {title ? <CardTitle>{title}</CardTitle> : null}
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
          </div>
          {actions ? <CardAction>{actions}</CardAction> : null}
        </CardHeader>
      ) : null}

      <CardContent className={cn("pt-(--card-spacing)", contentClassName)}>{body}</CardContent>

      {footer && !loading && !error ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}

export { WidgetCard };
