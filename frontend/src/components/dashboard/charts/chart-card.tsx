"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { WidgetCard } from "@/components/dashboard/widgets";
import type { ChartCardProps } from "./types";

/**
 * Standard wrapper for dashboard charts — title, legend, actions, export, async states.
 */
function ChartCard({
  title,
  description,
  legend,
  actions,
  exportSlot,
  children,
  loading,
  empty,
  error,
  onRetry,
  emptyState,
  summary,
  className,
  contentClassName,
  height = 280,
}: ChartCardProps) {
  const headerActions =
    actions || exportSlot ? (
      <div className="flex items-center gap-1.5">
        {actions}
        {exportSlot}
      </div>
    ) : undefined;

  return (
    <WidgetCard
      title={title}
      description={description}
      actions={headerActions}
      loading={loading}
      empty={empty}
      error={error}
      onRetry={onRetry}
      emptyState={emptyState}
      className={className}
      contentClassName={cn("flex flex-col gap-3", contentClassName)}
      footer={legend}
      label={typeof title === "string" ? title : "Chart"}
    >
      <div
        className="relative w-full"
        style={{ minHeight: height }}
        role="img"
        aria-label={summary}
      >
        {children}
      </div>
    </WidgetCard>
  );
}

export { ChartCard };
