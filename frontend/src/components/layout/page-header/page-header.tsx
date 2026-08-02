import * as React from "react";

import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { AppBreadcrumb, type AppBreadcrumbItem } from "@/components/layout/breadcrumbs/breadcrumb";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: AppBreadcrumbItem[];
  className?: string;
}

/**
 * Reusable header for every page: optional breadcrumb trail, title,
 * description, and a right-aligned actions slot (buttons, filters, …).
 * Stacks vertically on mobile so actions never get cramped.
 */
export function PageHeader({ title, description, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <AppBreadcrumb items={breadcrumbs} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Text variant="heading" as="h1" className="truncate">
            {title}
          </Text>
          {description && <Text tone="secondary">{description}</Text>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
