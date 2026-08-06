import * as React from "react";

import { cn } from "@/lib/utils";
import type { StatsSummaryProps } from "./types";

/** A compact, single-line list of key numbers — for page/section headers where a full `StatsGrid` would be too heavy. */
function StatsSummary({ items, className }: StatsSummaryProps) {
  return (
    <dl className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          {index > 0 ? <span className="h-4 w-px bg-border" aria-hidden="true" /> : null}
          <div className="flex items-center gap-1.5">
            {item.icon ? (
              <span className="text-muted-foreground [&>svg]:size-4" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <dd className="text-sm font-semibold text-foreground tabular-nums">{item.value}</dd>
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}

export { StatsSummary };
