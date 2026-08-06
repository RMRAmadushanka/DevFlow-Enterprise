"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { SearchResultItemProps } from "./types";

/**
 * A single hit in a search results list — icon, title, description, and an
 * optional category chip. Renders as a button (or link when `href` is set).
 */
function SearchResultItem({
  icon,
  title,
  description,
  category,
  active,
  onSelect,
  className,
  href,
}: SearchResultItemProps) {
  const sharedClassName = cn(
    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors",
    "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
    active && "bg-muted",
    className
  );

  const content = (
    <>
      {icon ? (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4">
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
          {category ? (
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
              {category}
            </span>
          ) : null}
        </span>
        {description ? (
          <span className="line-clamp-2 text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={sharedClassName} onClick={onSelect} data-slot="search-result-item">
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={sharedClassName}
      onClick={onSelect}
      data-slot="search-result-item"
      aria-current={active ? "true" : undefined}
    >
      {content}
    </button>
  );
}

export { SearchResultItem };
