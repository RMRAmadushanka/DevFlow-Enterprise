"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { HeatMapWidgetProps } from "./types";

function intensityClass(ratio: number): string {
  if (ratio <= 0) return "bg-muted";
  if (ratio < 0.25) return "bg-primary/20";
  if (ratio < 0.5) return "bg-primary/40";
  if (ratio < 0.75) return "bg-primary/65";
  return "bg-primary";
}

/**
 * Contribution-style heatmap grid with tooltips and a 5-step legend.
 */
const HeatMapWidget = React.memo(function HeatMapWidget({
  data,
  xLabels,
  yLabels,
  maxValue,
  className,
  summary,
  showLegend = true,
}: HeatMapWidgetProps) {
  const max =
    maxValue ??
    data.reduce((acc, cell) => (cell.value > acc ? cell.value : acc), 0) ??
    1;

  const lookup = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const cell of data) {
      map.set(`${cell.x}:${cell.y}`, cell.value);
    }
    return map;
  }, [data]);

  return (
    <div
      data-slot="heatmap-widget"
      className={cn("flex w-full flex-col gap-3", className)}
      role="img"
      aria-label={summary}
    >
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(1.25rem, 1fr))`,
          }}
        >
          <div />
          {xLabels.map((label) => (
            <div
              key={label}
              className="truncate px-0.5 text-center text-[10px] text-muted-foreground"
            >
              {label}
            </div>
          ))}

          {yLabels.map((y) => (
            <React.Fragment key={y}>
              <div className="flex items-center pr-2 text-xs text-muted-foreground">{y}</div>
              {xLabels.map((x) => {
                const value = lookup.get(`${x}:${y}`) ?? 0;
                const ratio = max > 0 ? value / max : 0;
                return (
                  <div
                    key={`${x}-${y}`}
                    title={`${x} / ${y}: ${value}`}
                    className={cn(
                      "aspect-square min-h-5 min-w-5 rounded-sm ring-1 ring-border/40",
                      intensityClass(ratio)
                    )}
                    aria-label={`${x}, ${y}: ${value}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {showLegend ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 0.2, 0.45, 0.7, 1].map((r) => (
            <span
              key={r}
              className={cn("size-3 rounded-sm ring-1 ring-border/40", intensityClass(r))}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      ) : null}

      <p className="sr-only">{summary}</p>
    </div>
  );
});

export { HeatMapWidget };
