"use client";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useServices } from "../hooks/use-monitoring";
import { AlertFilters } from "./alert-filters";
import { CpuUsageChart } from "./cpu-usage-chart";
import { DiskUsageChart } from "./disk-usage-chart";
import { MemoryUsageChart } from "./memory-usage-chart";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { NetworkTrafficChart } from "./network-traffic-chart";
import { ServiceHealthGrid } from "./service-health-grid";
import { ServiceGridSkeleton } from "./monitoring-skeleton";

export interface ServicesViewProps {
  title?: string;
  description?: string;
}

function ServicesView({
  title = "Services",
  description = "Health and latency across platform services.",
}: ServicesViewProps) {
  const { data, isLoading, isError, refetch } = useServices();

  return (
    <PermissionGuard
      permission="monitoring.read"
      fallback={<MonitoringEmptyState variant="no-permission" />}
    >
      <ListPageTemplate
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Monitoring", href: routes.app.monitoring },
          { label: "Services", href: routes.app.monitoringServices },
        ]}
        filters={<AlertFilters showEnvironment />}
      >
        {isLoading ? <ServiceGridSkeleton /> : null}
        {isError ? (
          <MonitoringEmptyState
            variant="no-data"
            action={
              <button
                type="button"
                className="text-sm font-medium text-primary underline"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            }
          />
        ) : null}
        {!isLoading && !isError ? (
          <div className="flex flex-col gap-6">
            <ServiceHealthGrid services={data ?? []} />
            <div className="grid gap-4 lg:grid-cols-2">
              <CpuUsageChart />
              <MemoryUsageChart />
              <DiskUsageChart />
              <NetworkTrafficChart />
            </div>
          </div>
        ) : null}
      </ListPageTemplate>
    </PermissionGuard>
  );
}

export { ServicesView };
