"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";
import type { Tone } from "@/components/data-display/shared/types";
import type { TimelineProps } from "./types";

const toneDotClassName: Record<Tone, string> = {
  success: "bg-success text-success",
  warning: "bg-warning text-warning",
  danger: "bg-destructive text-destructive",
  info: "bg-info text-info",
  neutral: "bg-muted-foreground text-muted-foreground",
};

/**
 * Vertical or horizontal milestone timeline for releases, deployments,
 * and project phases. Prop-driven — no data fetching.
 */
function Timeline({
  items,
  orientation = "vertical",
  className,
  label = "Timeline",
}: TimelineProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <ol
      data-slot="timeline"
      data-orientation={orientation}
      aria-label={label}
      className={cn(
        isHorizontal
          ? "flex items-start gap-0 overflow-x-auto pb-2"
          : "relative flex flex-col gap-0",
        className
      )}
    >
      {items.map((item, index) => {
        const tone = item.tone ?? "neutral";
        const isLast = index === items.length - 1;

        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: isHorizontal ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.fast,
              ease: easing.decelerate,
              delay: Math.min(index, 8) * 0.04,
            }}
            className={cn(
              "relative flex",
              isHorizontal ? "min-w-[10rem] flex-1 flex-col items-center px-2" : "gap-3 pb-6 last:pb-0"
            )}
          >
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bg-border",
                  isHorizontal
                    ? "top-3 left-1/2 h-px w-full"
                    : "top-3 left-[0.6875rem] h-full w-px"
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-background",
                item.active ? "ring-2 ring-primary/40" : "",
                item.icon
                  ? cn("bg-background text-current [&>svg]:size-3", toneDotClassName[tone])
                  : cn("size-3 mt-1.5", toneDotClassName[tone], "border-0")
              )}
              aria-hidden="true"
            >
              {item.icon}
            </span>

            <div
              className={cn(
                "flex min-w-0 flex-col gap-0.5",
                isHorizontal ? "mt-2 items-center text-center" : "flex-1 pt-0"
              )}
            >
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.description ? (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              ) : null}
              {item.timestamp ? (
                <time className="text-xs text-muted-foreground">{item.timestamp}</time>
              ) : null}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export { Timeline };
