"use client";

import * as React from "react";
import { motion } from "framer-motion";

import {
  DashboardGrid,
  DashboardGridItem,
  MetricCard,
  SystemStatusWidget,
} from "@/components/dashboard";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem } from "@/design-system/motion/variants";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { toDashboardErrorMessage } from "../utils/errors";

const OverviewMetrics = React.memo(function OverviewMetrics() {
  const { data, isLoading, isError, error, refetch } = useDashboardMetrics();
  const metrics = data?.metrics ?? [];

  if (isError) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Could not load metrics"
        description={toDashboardErrorMessage(error)}
        action={
          <Button type="button" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!isLoading && metrics.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No metrics"
        description="Metrics will appear once engineering activity is available."
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-4"
      data-slot="overview-metrics"
    >
      <DashboardGrid columns={12} gap={4}>
        {metrics.map((metric) => (
          <DashboardGridItem key={metric.id} span={1} mdSpan={4} xlSpan={2}>
            <motion.div variants={staggerItem}>
              <MetricCard
                title={metric.title}
                value={metric.value}
                change={metric.change}
                changeLabel={metric.changeLabel}
                trend={metric.trend}
                variant={metric.variant}
                description={metric.description}
                loading={isLoading}
              />
            </motion.div>
          </DashboardGridItem>
        ))}
      </DashboardGrid>

      {data?.systemHealth ? (
        <SystemStatusWidget
          title="System health"
          loading={isLoading}
          items={data.systemHealth.map((item) => ({
            id: item.id,
            name: item.name,
            status: item.status,
            description: item.detail,
          }))}
        />
      ) : null}
    </motion.div>
  );
});

export { OverviewMetrics };
