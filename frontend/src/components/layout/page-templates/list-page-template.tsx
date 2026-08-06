"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { PageSkeleton } from "@/components/architecture/loading";
import type { ListPageTemplateProps } from "./types";

/**
 * List page shell — header, actions, filter toolbar, content, pagination.
 * Pages compose feature tables/cards inside `children`; this template owns layout only.
 */
function ListPageTemplate({
  title,
  description,
  actions,
  breadcrumbs,
  filters,
  viewMode = "table",
  onViewModeChange,
  showViewToggle = false,
  children,
  pagination,
  loading,
  empty,
  className,
}: ListPageTemplateProps) {
  const toolbar =
    filters || showViewToggle ? (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">{filters}</div>
        {showViewToggle ? (
          <div
            role="group"
            aria-label="View mode"
            className="flex shrink-0 items-center gap-1"
          >
            <Button
              type="button"
              size="icon-sm"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              aria-pressed={viewMode === "table"}
              aria-label="Table view"
              onClick={() => onViewModeChange?.("table")}
            >
              <List />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              aria-pressed={viewMode === "cards"}
              aria-label="Card view"
              onClick={() => onViewModeChange?.("cards")}
            >
              <LayoutGrid />
            </Button>
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <PageContainer className={cn("flex flex-col gap-6", className)} data-slot="list-page-template">
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        breadcrumbs={breadcrumbs}
      />
      {toolbar}
      {loading ? (
        <PageSkeleton variant="list" />
      ) : empty ? (
        empty
      ) : (
        <div className="flex min-h-0 flex-col gap-4">
          {children}
          {pagination}
        </div>
      )}
    </PageContainer>
  );
}

export { ListPageTemplate };
