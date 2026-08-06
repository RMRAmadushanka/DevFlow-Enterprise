"use client";

import Link from "next/link";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { AnalyticsFilters } from "./analytics-filters";
import { AnalyticsOverview } from "./analytics-overview";
import { AnalyticsSummary } from "./analytics-summary";
import { EngineeringDashboard } from "./engineering-dashboard";
import { MonitoringEmptyState } from "./monitoring-empty-state";

export interface AnalyticsViewProps {
  title?: string;
  description?: string;
}

function AnalyticsView({
  title = "Analytics",
  description = "Engineering delivery and reliability analytics.",
}: AnalyticsViewProps) {
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
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              render={<Link href={routes.app.analyticsExecutive} />}
              size="sm"
              variant="outline"
            >
              Executive
            </Button>
            <PermissionGuard permission="analytics.export">
              <Button
                render={<Link href={routes.app.analyticsReports} />}
                size="sm"
                variant="outline"
              >
                Reports
              </Button>
            </PermissionGuard>
          </div>
        }
        filters={<AnalyticsFilters />}
      >
        <div className="flex flex-col gap-8">
          <AnalyticsSummary />
          <AnalyticsOverview />
          <EngineeringDashboard />
        </div>
      </ListPageTemplate>
    </PermissionGuard>
  );
}

export { AnalyticsView };
