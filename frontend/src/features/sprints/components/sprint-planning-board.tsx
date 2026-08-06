"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

import { AlertBanner } from "@/components/feedback/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useMoveTasksToSprint, useSprintPlanning } from "../hooks/use-sprints";
import { useSprintStore } from "../store/sprint.store";
import type { BacklogItem } from "../types/sprint.types";
import { BacklogTaskCard } from "./backlog-task-card";
import { PlanningSkeleton } from "./sprint-skeleton";
import { SprintEmptyState } from "./sprint-empty-state";

export interface SprintPlanningBoardProps {
  sprintId: string;
  className?: string;
}

function SprintPlanningBoard({ sprintId, className }: SprintPlanningBoardProps) {
  const { data, isLoading } = useSprintPlanning(sprintId);
  const moveTasks = useMoveTasksToSprint(sprintId);
  const selectedIds = useSprintStore((s) => s.selectedBacklogIds);
  const setSelectedBacklogIds = useSprintStore((s) => s.setSelectedBacklogIds);

  const [backlog, setBacklog] = React.useState<BacklogItem[]>([]);
  const [sprintTasks, setSprintTasks] = React.useState<BacklogItem[]>([]);

  React.useEffect(() => {
    if (!data) return;
    setBacklog(data.backlog);
    setSprintTasks(data.sprintTasks);
  }, [data?.backlog, data?.sprintTasks]);

  if (isLoading) {
    return <PlanningSkeleton />;
  }

  if (!data) {
    return <SprintEmptyState variant="no-backlog" />;
  }

  const capacityPoints = data.capacityPoints;
  const allocatedPoints = data.allocatedPoints;
  const overCapacity = allocatedPoints > capacityPoints;

  function moveToSprint(ids: string[]) {
    if (ids.length === 0) return;
    const moving = backlog.filter((item) => ids.includes(item.id));
    setBacklog((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSprintTasks((prev) => [...prev, ...moving]);
    void moveTasks.mutateAsync(ids);
    setSelectedBacklogIds(selectedIds.filter((id) => !ids.includes(id)));
  }

  function moveToBacklog(ids: string[]) {
    if (ids.length === 0) return;
    const moving = sprintTasks.filter((item) => ids.includes(item.id));
    setSprintTasks((prev) => prev.filter((item) => !ids.includes(item.id)));
    setBacklog((prev) => [...prev, ...moving]);
    setSelectedBacklogIds(selectedIds.filter((id) => !ids.includes(id)));
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} data-slot="sprint-planning-board">
      {overCapacity ? (
        <AlertBanner
          tone="warning"
          title="Over capacity"
          description={`Sprint has ${allocatedPoints} points allocated against ${capacityPoints} capacity.`}
          icon={<AlertTriangle className="size-4" />}
        />
      ) : null}

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
        <span>
          Capacity: <strong className="tabular-nums">{allocatedPoints}</strong> /{" "}
          <strong className="tabular-nums">{capacityPoints}</strong> pts
        </span>
        {selectedIds.length > 0 ? (
          <span className="text-muted-foreground">{selectedIds.length} selected</span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Backlog</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={selectedIds.length === 0 || moveTasks.isPending}
              onClick={() => {
                const ids = selectedIds.filter((id) => backlog.some((b) => b.id === id));
                moveToSprint(ids);
              }}
            >
              <ArrowRight className="size-4" />
              Add to sprint
            </Button>
          </CardHeader>
          <CardContent className="flex max-h-[480px] flex-col gap-2 overflow-y-auto">
            {backlog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No backlog items.</p>
            ) : (
              backlog.map((item) => (
                <BacklogTaskCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onSelect={(id, selected) => {
                    if (selected) {
                      setSelectedBacklogIds([...selectedIds, id]);
                    } else {
                      setSelectedBacklogIds(selectedIds.filter((x) => x !== id));
                    }
                  }}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Current sprint</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={selectedIds.length === 0}
              onClick={() => {
                const ids = selectedIds.filter((id) => sprintTasks.some((t) => t.id === id));
                moveToBacklog(ids);
              }}
            >
              <ArrowLeft className="size-4" />
              Remove
            </Button>
          </CardHeader>
          <CardContent className="flex max-h-[480px] flex-col gap-2 overflow-y-auto">
            {sprintTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks in sprint yet.</p>
            ) : (
              sprintTasks.map((item) => (
                <BacklogTaskCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onSelect={(id, selected) => {
                    if (selected) {
                      setSelectedBacklogIds([...selectedIds, id]);
                    } else {
                      setSelectedBacklogIds(selectedIds.filter((x) => x !== id));
                    }
                  }}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { SprintPlanningBoard };
