"use client";

import * as React from "react";
import Link from "next/link";

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
import type { BreadcrumbItem, BreadcrumbsProps } from "./types";

function renderCrumb(item: BreadcrumbItem, isLast: boolean) {
  const Icon = item.icon;
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {item.label}
    </span>
  );

  return (
    <BreadcrumbItemRoot key={`${item.label}-${item.href ?? "current"}`}>
      {isLast || !item.href ? (
        <BreadcrumbPage>{inner}</BreadcrumbPage>
      ) : (
        <BreadcrumbLink render={<Link href={item.href} />}>{inner}</BreadcrumbLink>
      )}
    </BreadcrumbItemRoot>
  );
}

/**
 * Page trail with overflow collapse into a dropdown. Same interaction model
 * as the layout `AppBreadcrumb` — use this from feature pages; use the
 * layout export when composing inside the shell.
 */
function Breadcrumbs({ items, maxVisible = 4, className }: BreadcrumbsProps) {
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
                    <DropdownMenuItem
                      key={item.label}
                      render={item.href ? <Link href={item.href} /> : undefined}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItemRoot>
            <BreadcrumbSeparator />
            {lastTwo.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                {renderCrumb(item, index === lastTwo.length - 1)}
              </React.Fragment>
            ))}
          </>
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              {renderCrumb(item, index === items.length - 1)}
            </React.Fragment>
          ))
        )}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}

export { Breadcrumbs };
