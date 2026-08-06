"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FolderOpen, SearchX, Lock, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";
import type { EmptyStateProps, EmptyStateVariant } from "./types";

const variantDefaults: Record<EmptyStateVariant, { icon: React.ReactNode; title: string; description: string }> = {
  "no-data": {
    icon: <FolderOpen />,
    title: "No data yet",
    description: "Get started by creating your first item.",
  },
  "no-results": {
    icon: <SearchX />,
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  "no-permission": {
    icon: <Lock />,
    title: "You don't have access",
    description: "Contact an admin if you think this is a mistake.",
  },
  error: {
    icon: <AlertTriangle />,
    title: "Something went wrong",
    description: "Please try again, or contact support if the problem persists.",
  },
};

/**
 * The empty/error placeholder for any list, table, or grid — swap the
 * `variant` for the right default copy/icon, or override `title`/
 * `description`/`icon`/`action` individually.
 */
function EmptyState({ variant = "no-data", title, description, icon, action, className }: EmptyStateProps) {
  const defaults = variantDefaults[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.moderate, ease: easing.decelerate }}
      className={cn("flex flex-col items-center gap-3 px-6 py-12 text-center", className)}
      role={variant === "error" ? "alert" : undefined}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-6">
        {icon ?? defaults.icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title ?? defaults.title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description ?? defaults.description}</p>
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </motion.div>
  );
}

export { EmptyState };
