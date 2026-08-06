"use client";

import * as React from "react";

import { ProgressBar } from "@/components/data-display/progress";
import { WidgetCard } from "@/components/dashboard/widgets";
import type { ProgressWidgetProps } from "./types";

/**
 * Goal / percentage progress widget for sprints, quotas, and completion rates.
 */
function ProgressWidget({
  title,
  description,
  value,
  goal,
  currentLabel,
  tone = "info",
  loading,
  empty,
  error,
  onRetry,
  actions,
  className,
}: ProgressWidgetProps) {
  return (
    <WidgetCard
      title={title}
      description={description}
      actions={actions}
      loading={loading}
      empty={empty}
      error={error}
      onRetry={onRetry}
      className={className}
      footer={
        goal || currentLabel ? (
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            {currentLabel ? <span>{currentLabel}</span> : <span />}
            {goal ? <span>Goal: {goal}</span> : null}
          </div>
        ) : undefined
      }
    >
      <ProgressBar value={value} label="Progress" tone={tone} size="lg" showValue />
    </WidgetCard>
  );
}

export { ProgressWidget };
