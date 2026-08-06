"use client";

import Link from "next/link";

import { AreaChartWidget, WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useAnalytics } from "../../hooks/use-monitoring";
import { metricPointsToChartData } from "../shared";

const ErrorTrendsWidget = function ErrorTrendsWidget() {
  const { data, isLoading, isError, refetch } = useAnalytics();
  const points = data?.errorTrend ?? [];

  return (
    <WidgetCard
      title="Error trends"
      loading={isLoading}
      error={isError ? "Could not load errors" : undefined}
      onRetry={() => void refetch()}
      empty={points.length === 0}
      actions={
        <Button
          render={<Link href={routes.app.monitoringErrors} />}
          size="sm"
          variant="outline"
        >
          Errors
        </Button>
      }
    >
      {points.length > 0 ? (
        <AreaChartWidget
          data={metricPointsToChartData(points)}
          series={[{ dataKey: "value", name: "Errors" }]}
          xKey="label"
          height={180}
          showLegend={false}
          summary="Error trends over time"
        />
      ) : null}
    </WidgetCard>
  );
};

export { ErrorTrendsWidget };
