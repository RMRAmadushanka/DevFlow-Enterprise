import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbEllipsis,
  BreadcrumbItem as BreadcrumbItemRoot,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AppBreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface AppBreadcrumbProps {
  items: AppBreadcrumbItem[];
  /** Collapse the middle into a "…" menu once there are more than this many items. Set 0 to disable. */
  maxVisible?: number;
  className?: string;
}

function renderCrumb(item: AppBreadcrumbItem, isLast: boolean) {
  const Icon = item.icon;
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      {Icon && <Icon size={14} aria-hidden="true" />}
      {item.label}
    </span>
  );

  return (
    <BreadcrumbItemRoot key={item.label}>
      {isLast || !item.href ? (
        <BreadcrumbPage>{inner}</BreadcrumbPage>
      ) : (
        <BreadcrumbLink render={<Link href={item.href} />}>{inner}</BreadcrumbLink>
      )}
    </BreadcrumbItemRoot>
  );
}

/**
 * Page-level breadcrumb trail, e.g. "Projects / Travel Platform / Tasks".
 * Collapses overflow into a "…" dropdown once there are more than
 * `maxVisible` items (default 4), keeping the first and last two visible.
 */
export function AppBreadcrumb({ items, maxVisible = 4, className }: AppBreadcrumbProps) {
  if (items.length === 0) return null;

  const shouldCollapse = maxVisible > 0 && items.length > maxVisible;
  const first = items[0];
  const lastTwo = items.slice(-2);
  const collapsedMiddle = shouldCollapse ? items.slice(1, -2) : [];

  return (
    <BreadcrumbRoot className={className}>
      <BreadcrumbList>
        {shouldCollapse ? (
          <>
            {renderCrumb(first, false)}
            <BreadcrumbSeparator />
            <BreadcrumbItemRoot>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<button type="button" aria-label="Show hidden breadcrumb items" />}
                >
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {collapsedMiddle.map((item) => (
                    <DropdownMenuItem key={item.label} render={item.href ? <Link href={item.href} /> : undefined}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItemRoot>
            <BreadcrumbSeparator />
            {lastTwo.map((item, index) =>
              renderCrumb(item, index === lastTwo.length - 1)
            )}
          </>
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              {renderCrumb(item, index === items.length - 1)}
            </React.Fragment>
          ))
        )}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
