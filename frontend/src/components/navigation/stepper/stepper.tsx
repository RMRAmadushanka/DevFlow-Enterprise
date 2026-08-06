"use client";

import * as React from "react";
import { Check, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StepItem, StepperProps, StepStatus } from "./types";

function resolveStatus(step: StepItem, index: number, current: number): StepStatus {
  if (step.status) return step.status;
  if (index < current) return "completed";
  if (index === current) return "active";
  return "pending";
}

/**
 * Multi-step progress indicator for setup flows and wizards.
 */
function Stepper({
  steps,
  current = 0,
  orientation = "horizontal",
  onStepClick,
  className,
  label = "Progress",
}: StepperProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <ol
      data-slot="stepper"
      data-orientation={orientation}
      aria-label={label}
      className={cn(
        isHorizontal ? "flex w-full items-start gap-2" : "flex flex-col gap-0",
        className
      )}
    >
      {steps.map((step, index) => {
        const status = resolveStatus(step, index, current);
        const clickable = !!onStepClick && (status === "completed" || status === "active");
        const isLast = index === steps.length - 1;

        return (
          <li
            key={step.id}
            className={cn(
              "relative flex",
              isHorizontal ? "min-w-0 flex-1 flex-col items-center" : "gap-3 pb-6 last:pb-0"
            )}
            aria-current={status === "active" ? "step" : undefined}
          >
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bg-border",
                  isHorizontal
                    ? "top-4 left-[calc(50%+1.25rem)] h-px w-[calc(100%-2.5rem)]"
                    : "top-8 left-4 h-full w-px",
                  (status === "completed" || status === "active") && "bg-primary"
                )}
              />
            ) : null}

            <button
              type="button"
              disabled={!clickable}
              onClick={() => onStepClick?.(index)}
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold outline-none transition-colors",
                status === "completed" && "border-primary bg-primary text-primary-foreground",
                status === "active" && "border-primary bg-background text-primary ring-2 ring-primary/30",
                status === "pending" && "border-border bg-muted text-muted-foreground",
                status === "error" && "border-destructive bg-destructive/10 text-destructive",
                clickable && "cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50",
                !clickable && "cursor-default"
              )}
              aria-label={`Step ${index + 1}: ${typeof step.title === "string" ? step.title : "Step"}`}
            >
              {status === "completed" ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : status === "error" ? (
                <AlertCircle className="size-3.5" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </button>

            <div
              className={cn(
                "flex min-w-0 flex-col gap-0.5",
                isHorizontal ? "mt-2 items-center text-center" : "flex-1 pt-1"
              )}
            >
              <p
                className={cn(
                  "text-sm font-medium",
                  status === "pending" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {step.title}
                {step.optional ? (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
                ) : null}
              </p>
              {step.description ? (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { Stepper };
