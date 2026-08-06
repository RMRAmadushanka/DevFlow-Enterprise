"use client";

import {
  Activity,
  CheckCircle2,
  CircleDashed,
  Gauge,
  ListTodo,
  Target,
  Zap,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard";
import { cn } from "@/lib/utils";

import type { SprintMetrics } from "../types/sprint.types";
import { SprintHealthBadge } from "./sprint-status-badge";

export interface SprintMetricsProps {
  metrics: SprintMetrics;
  className?: string;
  loading?: boolean;
}

function SprintMetricsGrid({ metrics, className, loading }: SprintMetricsProps) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      data-slot="sprint-metrics"
    >
      <MetricCard
        title="Progress"
        value={`${metrics.progress}%`}
        description={`${metrics.completedPoints} of ${metrics.committedPoints} points`}
        icon={<Gauge className="size-4" />}
        loading={loading}
      />
      <MetricCard
        title="Velocity"
        value={String(metrics.velocity)}
        description="Story points per sprint"
        icon={<Zap className="size-4" />}
        loading={loading}
      />
      <MetricCard
        title="Tasks"
        value={`${metrics.completedTasks}/${metrics.totalTasks}`}
        description={`${metrics.remainingTasks} remaining`}
        icon={<ListTodo className="size-4" />}
        loading={loading}
      />
      <MetricCard
        title="Capacity"
        value={`${metrics.committedPoints}/${metrics.capacityPoints}`}
        description={`${metrics.remainingDays} days left`}
        icon={<Target className="size-4" />}
        loading={loading}
      />
      <MetricCard
        title="Completed"
        value={String(metrics.completedPoints)}
        description="Story points done"
        icon={<CheckCircle2 className="size-4" />}
        variant="success"
        loading={loading}
      />
      <MetricCard
        title="Remaining"
        value={String(metrics.remainingPoints)}
        description="Story points left"
        icon={<CircleDashed className="size-4" />}
        loading={loading}
      />
      <MetricCard
        title="Health"
        value={<SprintHealthBadge health={metrics.health} size="md" />}
        description="Sprint health indicator"
        icon={<Activity className="size-4" />}
        loading={loading}
      />
    </div>
  );
}

export { SprintMetricsGrid as SprintMetrics };
