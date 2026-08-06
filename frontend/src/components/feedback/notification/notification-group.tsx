import * as React from "react";

import { cn } from "@/lib/utils";
import type { NotificationGroupProps } from "./types";

function NotificationGroup({ heading, children, className }: NotificationGroupProps) {
  return (
    <section data-slot="notification-group" className={cn("flex flex-col gap-1", className)}>
      <h3 className="px-2 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {heading}
      </h3>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

export { NotificationGroup };
