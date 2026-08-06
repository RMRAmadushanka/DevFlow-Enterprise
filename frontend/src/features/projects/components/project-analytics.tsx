"use client";

import * as React from "react";

import {
  AreaChartWidget,
  BarChartWidget,
  ChartCard,
  DashboardGrid,
  DashboardGridItem,
  DonutChartWidget,
  GaugeChart,
  StatisticCard,
} from "@/components/dashboard";
import { FeatureEmptyState } from "@/components/architecture/empty";

import type { ProjectAnalytics as ProjectAnalyticsData } from "../types/project.types";

export interface ProjectAnalyticsProps {
  analytics: ProjectAnalyticsData;
  loading?: boolean;
  className?: string;
}

function ProjectAnalyticsCharts({ analytics, loading, className }: ProjectAnalyticsProps) {
  const hasData =
    analytics.taskCompletionTrend.length > 0 ||
    analytics.velocity.length > 0 ||
    analytics.burndown.length > 0 ||
    analytics.workload.length > 0 ||
    analytics.issueDistribution.length > 0;

  if (!loading && !hasData) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No analytics data"
        description="Charts will populate once tasks and sprints have enough history."
      />
    );
  }

  return (
    <div className={className} data-slot="project-analytics">
      <DashboardGrid columns={12} gap={4}>
        <DashboardGridItem span={1} mdSpan={4}>
          <StatisticCard
            title="Health score"
            value={`${analytics.healthScore}`}
            comparison="Out of 100"
            variant={
              analytics.healthScore >= 80
                ? "success"
                : analytics.healthScore >= 50
                  ? "warning"
                  : "danger"
            }
            loading={loading}
          />
        </DashboardGridItem>
        <DashboardGridItem span={1} mdSpan={8}>
          <ChartCard title="Health gauge" loading={loading} height={220}>
            <GaugeChart
              value={analytics.healthScore}
              label="Health"
              size={180}
              summary={`Project health score ${analytics.healthScore} out of 100`}
            />
          </ChartCard>
        </DashboardGridItem>

        <DashboardGridItem span={1} mdSpan={6}>
          <ChartCard
            title="Task completion trend"
            description="Opened vs completed tasks over time"
            loading={loading}
          >
            <AreaChartWidget
              data={analytics.taskCompletionTrend}
              xKey="label"
              series={[
                { dataKey: "completed", name: "Completed" },
                { dataKey: "opened", name: "Opened" },
              ]}
              summary="Task completion trend chart"
            />
          </ChartCard>
        </DashboardGridItem>

        <DashboardGridItem span={1} mdSpan={6}>
          <ChartCard title="Sprint velocity" description="Story points per sprint" loading={loading}>
            <BarChartWidget
              data={analytics.velocity}
              xKey="label"
              series={[{ dataKey: "points", name: "Points" }]}
              summary="Sprint velocity bar chart"
            />
          </ChartCard>
        </DashboardGridItem>

        <DashboardGridItem span={1} mdSpan={6}>
          <ChartCard title="Burndown" description="Remaining vs ideal work" loading={loading}>
            <AreaChartWidget
              data={analytics.burndown}
              xKey="label"
              series={[
                { dataKey: "remaining", name: "Remaining" },
                { dataKey: "ideal", name: "Ideal" },
              ]}
              summary="Sprint burndown chart"
            />
          </ChartCard>
        </DashboardGridItem>

        <DashboardGridItem span={1} mdSpan={6}>
          <ChartCard title="Team workload" description="Assigned vs completed" loading={loading}>
            <BarChartWidget
              data={analytics.workload}
              xKey="label"
              series={[
                { dataKey: "assigned", name: "Assigned" },
                { dataKey: "completed", name: "Completed" },
              ]}
              layout="horizontal"
              summary="Team workload comparison chart"
            />
          </ChartCard>
        </DashboardGridItem>

        <DashboardGridItem span={1} mdSpan={6}>
          <ChartCard title="Issue distribution" loading={loading}>
            <DonutChartWidget
              data={analytics.issueDistribution}
              centerValue={String(
                analytics.issueDistribution.reduce((sum, item) => sum + item.value, 0)
              )}
              centerLabel="Issues"
              summary="Issue distribution donut chart"
            />
          </ChartCard>
        </DashboardGridItem>
      </DashboardGrid>
    </div>
  );
}

const ProjectAnalytics = React.memo(ProjectAnalyticsCharts);

export { ProjectAnalytics };
