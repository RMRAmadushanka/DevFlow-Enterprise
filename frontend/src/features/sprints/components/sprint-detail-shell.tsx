"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { DetailPageTemplate } from "@/components/layout/page-templates";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { ActivityTimeline } from "@/components/data-display/activity";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { SPRINT_DETAIL_TABS } from "../constants/sprint.constants";
import { useSprint, useSprintActivity, useVelocityHistory } from "../hooks/use-sprints";
import type { SprintDetail } from "../types/sprint.types";
import { CompleteSprintModal } from "./complete-sprint-modal";
import { DeleteSprintModal } from "./delete-sprint-modal";
import { EditSprintModal } from "./edit-sprint-modal";
import { CapacityPlanningCard } from "./capacity-planning-card";
import { SprintBoard } from "./sprint-board";
import { SprintGoalCard } from "./sprint-goal-card";
import { SprintHeader } from "./sprint-header";
import { SprintMetrics } from "./sprint-metrics";
import { SprintPlanningBoard } from "./sprint-planning-board";
import { SprintProgressCard } from "./sprint-progress-card";
import { SprintReports } from "./sprint-reports";
import { SprintReviewCard } from "./sprint-review-card";
import { SprintRetrospective } from "./sprint-retrospective";
import { SprintSkeleton } from "./sprint-skeleton";

export interface SprintDetailShellProps {
  sprintId: string;
}

function getActiveTab(pathname: string, sprintId: string): string {
  const base = `/sprints/${sprintId}`;
  if (pathname.startsWith(`${base}/edit`)) return "settings";
  if (pathname.includes("/reports")) return "reports";
  if (pathname.includes("/board")) return "board";
  if (pathname.includes("/members")) return "members";
  if (pathname.includes("/activity")) return "activity";
  return "overview";
}

function SprintDetailShell({ sprintId }: SprintDetailShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sprint, isLoading, isError } = useSprint(sprintId);

  const [editOpen, setEditOpen] = React.useState(false);
  const [completeOpen, setCompleteOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const activeTab = getActiveTab(pathname, sprintId);

  const tabs = React.useMemo(
    () =>
      SPRINT_DETAIL_TABS.map((tab) => ({
        ...tab,
        href:
          tab.value === "overview"
            ? routes.app.sprint(sprintId)
            : `${routes.app.sprint(sprintId)}/${tab.value}`,
      })),
    [sprintId]
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <SprintSkeleton />
      </div>
    );
  }

  if (isError || !sprint) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Sprint not found"
        description="This sprint may have been deleted or you no longer have access."
        action={<Button render={<Link href={routes.app.sprints} />}>Back to sprints</Button>}
      />
    );
  }

  return (
    <>
      <DetailPageTemplate
        title={sprint.name}
        description={sprint.goal}
        breadcrumbs={[
          { label: "Sprints", href: routes.app.sprints },
          { label: sprint.name },
        ]}
        actions={
          <>
            <PermissionGuard permission="sprint.update">
              <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="sprint.delete">
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </PermissionGuard>
          </>
        }
        tabs={tabs.map(({ value, label }) => ({ value, label }))}
        activeTab={activeTab}
        onTabChange={(value) => {
          const next = tabs.find((tab) => tab.value === value);
          if (next) router.push(next.href);
        }}
      >
        <div className="flex flex-col gap-6">
          <SprintHeader
            sprint={sprint}
            mode="detail"
            onComplete={() => setCompleteOpen(true)}
          />

          {activeTab === "overview" ? (
            <SprintOverviewContent sprint={sprint} />
          ) : null}

          {activeTab === "board" ? <SprintBoard projectId={sprint.projectId} /> : null}

          {activeTab === "reports" ? <SprintReportsTab sprint={sprint} /> : null}

          {activeTab === "members" ? (
            <SprintMetrics metrics={sprint.metrics} />
          ) : null}

          {activeTab === "activity" ? <SprintActivityTab sprintId={sprintId} /> : null}

          {activeTab === "settings" ? (
            <p className="text-sm text-muted-foreground">
              Sprint settings are available on the{" "}
              <Link href={routes.app.sprintEdit(sprintId)} className="text-primary underline">
                edit page
              </Link>
              .
            </p>
          ) : null}
        </div>
      </DetailPageTemplate>

      <EditSprintModal sprint={sprint} open={editOpen} onOpenChange={setEditOpen} />
      <CompleteSprintModal sprint={sprint} open={completeOpen} onOpenChange={setCompleteOpen} />
      <DeleteSprintModal sprint={sprint} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

function SprintReportsTab({ sprint }: { sprint: SprintDetail }) {
  const { data: velocityData, isLoading } = useVelocityHistory(sprint.projectId);
  return <SprintReports sprint={sprint} velocityData={velocityData} loading={isLoading} />;
}

function SprintActivityTab({ sprintId }: { sprintId: string }) {
  const { data: activity, isLoading } = useSprintActivity(sprintId);
  if (isLoading) {
    return <SprintSkeleton />;
  }
  return (
    <ActivityTimeline
      items={(activity ?? []).map((entry) => ({
        id: entry.id,
        action: entry.summary,
        description: entry.actorName,
        timestamp: entry.timestamp,
      }))}
    />
  );
}

function SprintOverviewContent({ sprint }: { sprint: SprintDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <SprintMetrics metrics={sprint.metrics} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SprintGoalCard goal={sprint.goal} description={sprint.description} />
        <SprintProgressCard
          completedPoints={sprint.metrics.completedPoints}
          committedPoints={sprint.metrics.committedPoints}
          remainingPoints={sprint.metrics.remainingPoints}
          completedTasks={sprint.metrics.completedTasks}
          totalTasks={sprint.metrics.totalTasks}
        />
      </div>
      {sprint.status === "planning" ? (
        <SprintPlanningBoard sprintId={sprint.id} />
      ) : null}
      {sprint.status === "active" || sprint.status === "planning" ? (
        <CapacityPlanningCard
          members={sprint.capacity}
          capacityPoints={sprint.metrics.capacityPoints}
          allocatedPoints={sprint.metrics.committedPoints}
        />
      ) : null}
      {sprint.review ? <SprintReviewCard review={sprint.review} /> : null}
      {sprint.retrospective ? (
        <SprintRetrospective retrospective={sprint.retrospective} />
      ) : null}
    </div>
  );
}

export { SprintDetailShell };
