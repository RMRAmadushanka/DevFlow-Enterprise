"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Drawer } from "./drawer";
import type { DetailDrawerProps } from "./types";

/**
 * Detail panel layout — header actions, primary content, and an optional
 * activity/history section below a divider.
 */
function DetailDrawer({
  actions,
  activity,
  children,
  title,
  ...props
}: DetailDrawerProps) {
  return (
    <Drawer
      {...props}
      title={
        title || actions ? (
          <span className="flex w-full items-start justify-between gap-3 pr-8">
            <span className="min-w-0 flex-1">{title}</span>
            {actions ? <span className="flex shrink-0 items-center gap-1">{actions}</span> : null}
          </span>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6">
        <div>{children}</div>
        {activity ? (
          <section className={cn("border-t border-border pt-4")}>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Activity
            </h3>
            {activity}
          </section>
        ) : null}
      </div>
    </Drawer>
  );
}

export { DetailDrawer };
