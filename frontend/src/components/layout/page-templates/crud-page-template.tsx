"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { PageSkeleton } from "@/components/architecture/loading";
import type { CrudPageTemplateProps } from "./types";

/**
 * Create / edit form page shell — header, form body, sticky action footer.
 * Pair with AppForm + Zod schemas inside `children`; mutations stay in feature hooks.
 */
function CrudPageTemplate({
  title,
  description,
  breadcrumbs,
  children,
  actions,
  loading,
  error,
  className,
  narrow = true,
}: CrudPageTemplateProps) {
  if (loading) {
    return (
      <PageContainer className={className} data-slot="crud-page-template">
        <PageSkeleton variant="form" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={cn("flex flex-col gap-6", className)} data-slot="crud-page-template">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
      {error}
      <div className={cn("flex w-full flex-col gap-6", narrow && "mx-auto max-w-2xl")}>
        <div className="min-w-0">{children}</div>
        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
            {actions}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}

export { CrudPageTemplate };
