"use client";

import * as React from "react";
import { motion } from "framer-motion";

import {
  DashboardGrid,
  DashboardGridItem,
  DashboardSection,
  DashboardSkeleton as WidgetSkeleton,
} from "@/components/dashboard";
import { DashboardPageTemplate } from "@/components/layout/page-templates";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/design-system/motion/variants";
import { useAuthUser } from "@/features/auth";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { useDashboardPreferences } from "../hooks/use-dashboard-preferences";
import type { DashboardWidgetId } from "../types/dashboard.types";
import { toDashboardErrorMessage } from "../utils/errors";
import { DashboardFilters } from "./dashboard-filters";
import { DashboardHeader } from "./dashboard-header";
import { DashboardPreferences } from "./dashboard-preferences";
import { DashboardSkeleton } from "./skeletons";
import { OverviewMetrics } from "./overview-metrics";
import { QuickActions } from "./quick-actions";
import { ProjectOverviewWidget } from "./project-overview-widget";
import { TeamActivityWidget } from "./team-activity-widget";
import { DeploymentSummaryWidget } from "./deployment-summary-widget";
import { SprintProgressWidget } from "./sprint-progress-widget";
import { WorkloadWidget } from "./workload-widget";
import { RecentProjectsWidget } from "./recent-projects-widget";
import { RecentActivityWidget } from "./recent-activity-widget";

const ProjectStatusChart = React.lazy(() =>
  import("./project-status-chart").then((m) => ({ default: m.ProjectStatusChart }))
);
const DeploymentTrendChart = React.lazy(() =>
  import("./deployment-trend-chart").then((m) => ({ default: m.DeploymentTrendChart }))
);
const SprintBurndownChart = React.lazy(() =>
  import("./sprint-burndown-chart").then((m) => ({ default: m.SprintBurndownChart }))
);
const TeamWorkloadChart = React.lazy(() =>
  import("./team-workload-chart").then((m) => ({ default: m.TeamWorkloadChart }))
);

function ChartFallback() {
  return <WidgetSkeleton variant="chart" height={280} />;
}

function WidgetSlot({ id, children }: { id: DashboardWidgetId; children: React.ReactNode }) {
  const { isVisible } = useDashboardPreferences();
  if (!isVisible(id)) return null;
  return <>{children}</>;
}

function DashboardView() {
  const user = useAuthUser();
  const { isLoading, isError, error, refetch } = useDashboardMetrics();
  const { orderedVisibleWidgets } = useDashboardPreferences();

  if (isLoading) {
    return (
      <DashboardPageTemplate title="Dashboard" description="Engineering overview">
        <DashboardSkeleton />
      </DashboardPageTemplate>
    );
  }

  if (isError) {
    return (
      <DashboardPageTemplate title="Dashboard" description="Engineering overview">
        <FeatureEmptyState
          variant="no-results"
          title="Dashboard unavailable"
          description={toDashboardErrorMessage(error)}
          action={
            <Button type="button" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      </DashboardPageTemplate>
    );
  }

  const widgetMap: Partial<Record<DashboardWidgetId, React.ReactNode>> = {
    "quick-actions": (
      <WidgetSlot id="quick-actions">
        <QuickActions />
      </WidgetSlot>
    ),
    "overview-metrics": (
      <WidgetSlot id="overview-metrics">
        <DashboardSection title="KPI overview" description="Key engineering metrics">
          <OverviewMetrics />
        </DashboardSection>
      </WidgetSlot>
    ),
    "project-overview": (
      <WidgetSlot id="project-overview">
        <ProjectOverviewWidget />
      </WidgetSlot>
    ),
    "project-status": (
      <WidgetSlot id="project-status">
        <React.Suspense fallback={<ChartFallback />}>
          <ProjectStatusChart />
        </React.Suspense>
      </WidgetSlot>
    ),
    "team-activity": (
      <WidgetSlot id="team-activity">
        <TeamActivityWidget />
      </WidgetSlot>
    ),
    "deployment-summary": (
      <WidgetSlot id="deployment-summary">
        <DeploymentSummaryWidget />
      </WidgetSlot>
    ),
    "deployment-trend": (
      <WidgetSlot id="deployment-trend">
        <React.Suspense fallback={<ChartFallback />}>
          <DeploymentTrendChart />
        </React.Suspense>
      </WidgetSlot>
    ),
    "sprint-progress": (
      <WidgetSlot id="sprint-progress">
        <SprintProgressWidget />
      </WidgetSlot>
    ),
    "sprint-burndown": (
      <WidgetSlot id="sprint-burndown">
        <React.Suspense fallback={<ChartFallback />}>
          <SprintBurndownChart />
        </React.Suspense>
      </WidgetSlot>
    ),
    workload: (
      <WidgetSlot id="workload">
        <WorkloadWidget />
      </WidgetSlot>
    ),
    "workload-chart": (
      <WidgetSlot id="workload-chart">
        <React.Suspense fallback={<ChartFallback />}>
          <TeamWorkloadChart />
        </React.Suspense>
      </WidgetSlot>
    ),
    "recent-projects": (
      <WidgetSlot id="recent-projects">
        <RecentProjectsWidget />
      </WidgetSlot>
    ),
    "recent-activity": (
      <WidgetSlot id="recent-activity">
        <RecentActivityWidget />
      </WidgetSlot>
    ),
  };

  return (
    <DashboardPageTemplate
      title="Dashboard"
      description="Engineering operations overview"
      breadcrumbs={[{ label: "Workspace" }, { label: "Dashboard" }]}
      actions={<DashboardPreferences />}
      filters={<DashboardFilters />}
    >
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
        data-slot="dashboard-view"
      >
        <DashboardHeader userName={user?.name ?? "there"} />

        {orderedVisibleWidgets.includes("quick-actions")
          ? widgetMap["quick-actions"]
          : null}

        {orderedVisibleWidgets.includes("overview-metrics")
          ? widgetMap["overview-metrics"]
          : null}

        <DashboardSection title="Main analytics" description="Projects, deployments, and delivery">
          <DashboardGrid columns={12} gap={4}>
            {orderedVisibleWidgets.includes("project-overview") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={8}>
                {widgetMap["project-overview"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("project-status") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={4}>
                {widgetMap["project-status"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("deployment-summary") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={7}>
                {widgetMap["deployment-summary"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("deployment-trend") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={5}>
                {widgetMap["deployment-trend"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("sprint-progress") ? (
              <DashboardGridItem span={1} mdSpan={6} xlSpan={4}>
                {widgetMap["sprint-progress"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("sprint-burndown") ? (
              <DashboardGridItem span={1} mdSpan={6} xlSpan={8}>
                {widgetMap["sprint-burndown"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("workload") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={7}>
                {widgetMap.workload}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("workload-chart") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={5}>
                {widgetMap["workload-chart"]}
              </DashboardGridItem>
            ) : null}
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection title="Activity & recent data">
          <DashboardGrid columns={12} gap={4}>
            {orderedVisibleWidgets.includes("team-activity") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={6}>
                {widgetMap["team-activity"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("recent-activity") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={6}>
                {widgetMap["recent-activity"]}
              </DashboardGridItem>
            ) : null}
            {orderedVisibleWidgets.includes("recent-projects") ? (
              <DashboardGridItem span={1} mdSpan={12} xlSpan={12}>
                {widgetMap["recent-projects"]}
              </DashboardGridItem>
            ) : null}
          </DashboardGrid>
        </DashboardSection>
      </motion.div>
    </DashboardPageTemplate>
  );
}

export { DashboardView };
