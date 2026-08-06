"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { Modal } from "@/components/feedback/modal";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useReports } from "../hooks/use-monitoring";
import type { ReportDefinition } from "../types/monitoring.types";
import { ExportReportModal } from "./export-report-modal";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { MonitoringSkeleton } from "./monitoring-skeleton";
import { ReportBuilder } from "./report-builder";
import { ReportCard } from "./report-card";

export interface ReportsViewProps {
  title?: string;
  description?: string;
}

function ReportsView({
  title = "Reports",
  description = "Build and export engineering and executive reports.",
}: ReportsViewProps) {
  const { data, isLoading, isError, refetch } = useReports();
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [exportTarget, setExportTarget] = React.useState<ReportDefinition | null>(null);

  const reports = data ?? [];

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
          { label: "Reports", href: routes.app.analyticsReports },
        ]}
        actions={
          <PermissionGuard permission="analytics.export">
            <Button type="button" size="sm" onClick={() => setBuilderOpen(true)}>
              <Plus className="size-4" />
              Create report
            </Button>
          </PermissionGuard>
        }
      >
        {isLoading ? <MonitoringSkeleton /> : null}
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
        {!isLoading && !isError && reports.length === 0 ? (
          <MonitoringEmptyState
            variant="no-reports"
            onCreateReport={() => setBuilderOpen(true)}
          />
        ) : null}
        {!isLoading && !isError && reports.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onExport={setExportTarget}
              />
            ))}
          </div>
        ) : null}
      </ListPageTemplate>

      <Modal
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        title="Create report"
        description="Choose metrics and an optional schedule."
        size="lg"
      >
        <ReportBuilder onSuccess={() => setBuilderOpen(false)} />
      </Modal>

      <ExportReportModal
        report={exportTarget}
        open={Boolean(exportTarget)}
        onOpenChange={(open) => {
          if (!open) setExportTarget(null);
        }}
      />
    </PermissionGuard>
  );
}

export { ReportsView };
