"use client";

import Link from "next/link";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { AnalyticsFilters } from "./analytics-filters";
import { ExecutiveDashboard } from "./executive-dashboard";
import { MonitoringEmptyState } from "./monitoring-empty-state";

export interface ExecutiveViewProps {
  title?: string;
  description?: string;
}

function ExecutiveView({
  title = "Executive dashboard",
  description = "High-level delivery, reliability, and utilization signals.",
}: ExecutiveViewProps) {
  return (
    <PermissionGuard
      permission="analytics.read"
      fallback={<MonitoringEmptyState variant="no-permission" />}
    >
      <ListPageTemplate
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Analytics", href: routes.app.analytics },
          { label: "Executive", href: routes.app.analyticsExecutive },
        ]}
        actions={
          <Button
            render={<Link href={routes.app.analyticsReports} />}
            size="sm"
            variant="outline"
          >
            Reports
          </Button>
        }
        filters={<AnalyticsFilters />}
      >
        <ExecutiveDashboard />
      </ListPageTemplate>
    </PermissionGuard>
  );
}

export { ExecutiveView };
