import * as React from "react";

import { cn } from "@/lib/utils";
import type { DashboardSectionProps } from "./types";

/**
 * Named group of dashboard widgets — title, optional description/actions, and children.
 */
function DashboardSection({ title, description, actions, children, className }: DashboardSectionProps) {
  return (
    <section data-slot="dashboard-section" className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-base font-medium text-foreground">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export { DashboardSection };
