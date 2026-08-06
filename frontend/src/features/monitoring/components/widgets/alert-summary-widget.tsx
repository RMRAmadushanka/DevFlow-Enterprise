"use client";

import Link from "next/link";

import { DonutChartWidget, WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useMonitoring } from "../../hooks/use-monitoring";

const AlertSummaryWidget = function AlertSummaryWidget() {
  const { data, isLoading, isError, refetch } = useMonitoring();
  const summary = data?.alertSummary;

  const slices = summary
    ? [
        { name: "Critical", value: summary.critical },
        { name: "High", value: summary.high },
        { name: "Medium", value: summary.medium },
        { name: "Low", value: summary.low },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <WidgetCard
      title="Alert summary"
      loading={isLoading}
      error={isError ? "Could not load alerts" : undefined}
      onRetry={() => void refetch()}
      empty={!summary}
      actions={
        <Button
          render={<Link href={routes.app.monitoringAlerts} />}
          size="sm"
          variant="outline"
        >
          Manage
        </Button>
      }
    >
      {summary ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {summary.active} active alert{summary.active === 1 ? "" : "s"}
          </p>
          {slices.length > 0 ? (
            <DonutChartWidget
              data={slices}
              centerValue={String(summary.active)}
              centerLabel="Active"
              height={180}
              summary={`Alert severity breakdown: ${summary.active} active`}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No severity counts yet.</p>
          )}
        </div>
      ) : null}
    </WidgetCard>
  );
};

export { AlertSummaryWidget };
