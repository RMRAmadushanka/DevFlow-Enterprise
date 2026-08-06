"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Tabs } from "@/components/navigation/tabs";
import { PageSkeleton } from "@/components/architecture/loading";
import type { DetailPageTemplateProps } from "./types";

/**
 * Detail page shell — header, optional tabs, main content + side panel.
 */
function DetailPageTemplate({
  title,
  description,
  breadcrumbs,
  actions,
  status,
  metadata,
  tabs,
  activeTab,
  onTabChange,
  children,
  sidePanel,
  loading,
  className,
}: DetailPageTemplateProps) {
  if (loading) {
    return (
      <PageContainer className={className} data-slot="detail-page-template">
        <PageSkeleton variant="detail" />
      </PageContainer>
    );
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {status}
      {actions}
    </div>
  );

  return (
    <PageContainer className={cn("flex flex-col gap-6", className)} data-slot="detail-page-template">
      <div className="flex flex-col gap-3">
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />
        {metadata ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {metadata}
          </div>
        ) : null}
      </div>

      {tabs && tabs.length > 0 ? (
        <Tabs
          items={tabs}
          value={activeTab}
          onValueChange={onTabChange}
          variant="underline"
        />
      ) : null}

      <div
        className={cn(
          "grid gap-6",
          sidePanel ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : "grid-cols-1"
        )}
      >
        <div className="min-w-0">{children}</div>
        {sidePanel ? (
          <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">{sidePanel}</aside>
        ) : null}
      </div>
    </PageContainer>
  );
}

export { DetailPageTemplate };
