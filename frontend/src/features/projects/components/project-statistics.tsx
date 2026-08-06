"use client";

import {
  Bug,
  CheckCircle2,
  Gauge,
  Rocket,
  Timer,
  Users,
  Zap,
} from "lucide-react";

import { DashboardGrid, DashboardGridItem, MetricCard } from "@/components/dashboard";
import { formatCompactNumber } from "@/components/data-display/shared/formatters";

import type { ProjectStatistics } from "../types/project.types";

export interface ProjectStatisticsProps {
  statistics: ProjectStatistics;
  loading?: boolean;
}

function ProjectStatisticsGrid({ statistics, loading }: ProjectStatisticsProps) {
  const completionRate =
    statistics.totalTasks > 0
      ? Math.round((statistics.completedTasks / statistics.totalTasks) * 100)
      : 0;

  const metrics = [
    {
      id: "tasks",
      title: "Total tasks",
      value: formatCompactNumber(statistics.totalTasks),
      description: `${formatCompactNumber(statistics.completedTasks)} completed`,
      icon: <CheckCircle2 className="size-4" aria-hidden />,
      variant: "default" as const,
    },
    {
      id: "bugs",
      title: "Open bugs",
      value: formatCompactNumber(statistics.openBugs),
      icon: <Bug className="size-4" aria-hidden />,
      variant: statistics.openBugs > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      id: "sprint",
      title: "Sprint progress",
      value: `${statistics.sprintProgress}%`,
      icon: <Gauge className="size-4" aria-hidden />,
      variant: "default" as const,
    },
    {
      id: "velocity",
      title: "Velocity",
      value: formatCompactNumber(statistics.velocity),
      description: "Story points / sprint",
      icon: <Zap className="size-4" aria-hidden />,
      variant: "default" as const,
    },
    {
      id: "deployments",
      title: "Deployments",
      value: formatCompactNumber(statistics.deployments),
      icon: <Rocket className="size-4" aria-hidden />,
      variant: "default" as const,
    },
    {
      id: "contributors",
      title: "Contributors",
      value: formatCompactNumber(statistics.contributors),
      icon: <Users className="size-4" aria-hidden />,
      variant: "default" as const,
    },
    {
      id: "cycle-time",
      title: "Cycle time",
      value: `${statistics.cycleTimeDays}d`,
      description: "Average days to complete",
      icon: <Timer className="size-4" aria-hidden />,
      variant: "default" as const,
    },
    {
      id: "completion",
      title: "Completion rate",
      value: `${completionRate}%`,
      icon: <CheckCircle2 className="size-4" aria-hidden />,
      variant: completionRate >= 80 ? ("success" as const) : ("default" as const),
    },
  ];

  return (
    <div data-slot="project-statistics">
      <DashboardGrid columns={4} gap={4}>
      {metrics.map((metric) => (
        <DashboardGridItem key={metric.id} span={1}>
          <MetricCard
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
            variant={metric.variant}
            loading={loading}
          />
        </DashboardGridItem>
      ))}
      </DashboardGrid>
    </div>
  );
}

export { ProjectStatisticsGrid as ProjectStatistics };
