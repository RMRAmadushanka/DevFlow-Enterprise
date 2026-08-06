"use client";

import * as React from "react";
import { FolderOpen, SearchX, Lock, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/data-display/empty-state";

export type FeatureEmptyVariant = "no-data" | "no-results" | "no-permission" | "first-time";

export interface FeatureEmptyStateProps {
  variant?: FeatureEmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const presets: Record<
  FeatureEmptyVariant,
  { icon: React.ReactNode; title: string; description: string }
> = {
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
  "first-time": {
    icon: <Sparkles />,
    title: "Welcome — let's get started",
    description: "Create your first item to begin using this area.",
  },
};

/**
 * Feature-level empty states — compose inside list/detail templates.
 */
function FeatureEmptyState({
  variant = "no-data",
  title,
  description,
  action,
  className,
}: FeatureEmptyStateProps) {
  const preset = presets[variant];
  const emptyVariant =
    variant === "no-permission" ? "no-permission" : variant === "no-results" ? "no-results" : "no-data";

  return (
    <EmptyState
      variant={emptyVariant}
      icon={preset.icon}
      title={title ?? preset.title}
      description={description ?? preset.description}
      action={action}
      className={className}
    />
  );
}

export { FeatureEmptyState };
