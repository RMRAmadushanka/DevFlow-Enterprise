"use client";

import * as React from "react";
import { Activity, Gauge, Server, ShieldAlert } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { formatPercent, formatMs } from "../utils/format";
import { useMonitoring, useIncidents } from "../hooks/use-monitoring";
import { useMonitoringStore } from "../store/monitoring.store";
import { findMetric } from "./shared";
import { AvailabilityChart } from "./availability-chart";
import { CpuUsageChart } from "./cpu-usage-chart";
import { CustomDashboard } from "./custom-dashboard";
import { DashboardWidgetPicker } from "./dashboard-widget-picker";
import { ErrorRateChart } from "./error-rate-chart";
import { IncidentBanner } from "./incident-banner";
import { IncidentDetailsDrawer } from "./incident-details-drawer";
import { MemoryUsageChart } from "./memory-usage-chart";
import { MetricCard } from "./metric-card";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { MonitoringHeader } from "./monitoring-header";
import { MonitoringSkeleton } from "./monitoring-skeleton";
import { ResponseTimeChart } from "./response-time-chart";
import { ServiceHealthGrid } from "./service-health-grid";
import { SystemHealthCard } from "./system-health-card";

export interface MonitoringDashboardProps {
  title?: string;
  description?: string;
}

function MonitoringDashboardContent() {
  const { data, isLoading, isError, refetch } = useMonitoring();
  const { data: incidents } = useIncidents();
  const selectedIncidentId = useMonitoringStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useMonitoringStore((s) => s.setSelectedIncidentId);
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  if (isLoading) return <MonitoringSkeleton />;

  if (isError || !data) {
    return (
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
    );
  }

  const cpu = findMetric(data.metrics, "cpu");
  const response = findMetric(data.metrics, "response_time");

  return (
    <div className="flex flex-col gap-6" data-slot="monitoring-dashboard">
      {!bannerDismissed && incidents ? (
        <IncidentBanner
          incidents={incidents}
          onDismiss={() => setBannerDismissed(true)}
          onSelect={(incident) => setSelectedIncidentId(incident.id)}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Availability"
          value={formatPercent(data.system.availability, 2)}
          icon={<Gauge className="size-4" />}
          variant={data.system.availability < 99 ? "warning" : "success"}
        />
        <MetricCard
          title="CPU"
          value={cpu ? formatPercent(cpu.current) : formatPercent(data.system.cpu)}
          change={cpu?.trend}
          icon={<Activity className="size-4" />}
        />
        <MetricCard
          title="Response time"
          value={response ? formatMs(response.current) : "—"}
          change={response?.trend}
          icon={<Server className="size-4" />}
        />
        <MetricCard
          title="Active alerts"
          value={String(data.alertSummary.active)}
          icon={<ShieldAlert className="size-4" />}
          variant={data.alertSummary.critical > 0 ? "danger" : "default"}
        />
      </div>

      <SystemHealthCard system={data.system} onRetry={() => void refetch()} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Services</h2>
        <ServiceHealthGrid services={data.services} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CpuUsageChart />
        <MemoryUsageChart />
        <ResponseTimeChart />
        <ErrorRateChart />
        <AvailabilityChart />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Custom widgets</h2>
        <CustomDashboard />
      </div>

      <IncidentDetailsDrawer
        incidentId={selectedIncidentId}
        open={Boolean(selectedIncidentId)}
        onOpenChange={(open) => {
          if (!open) setSelectedIncidentId(null);
        }}
      />
    </div>
  );
}

function MonitoringDashboard({
  title = "Monitoring",
  description = "Platform health, alerts, incidents, and reliability signals.",
}: MonitoringDashboardProps) {
  const { refetch, isFetching } = useMonitoring();
  const [pickerOpen, setPickerOpen] = React.useState(false);

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
        ]}
        actions={
          <MonitoringHeader
            showTitle={false}
            onRefresh={() => void refetch()}
            refreshing={isFetching}
            onCustomize={() => setPickerOpen(true)}
          />
        }
      >
        <MonitoringDashboardContent />
      </ListPageTemplate>

      <DashboardWidgetPicker open={pickerOpen} onOpenChange={setPickerOpen} />
    </PermissionGuard>
  );
}

export { MonitoringDashboard };
