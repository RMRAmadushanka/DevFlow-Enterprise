"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { PageSkeleton } from "@/components/architecture/loading";
import type { DashboardPageTemplateProps } from "./types";

/**
 * Analytics / monitoring page shell — header, filters, widget grid slot.
 * Compose `DashboardGrid` + chart widgets inside `children`.
 */
function DashboardPageTemplate({
  title,
  description,
  actions,
  breadcrumbs,
  filters,
  children,
  loading,
  className,
}: DashboardPageTemplateProps) {
  return (
    <PageContainer
      className={cn("flex flex-col gap-6", className)}
      data-slot="dashboard-page-template"
    >
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        breadcrumbs={breadcrumbs}
      />
      {filters}
      {loading ? <PageSkeleton variant="dashboard" /> : children}
    </PageContainer>
  );
}

export { DashboardPageTemplate };
