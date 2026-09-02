"use client";

import * as React from "react";
import { AlertTriangle, Pencil, Plus, X } from "lucide-react";

import { UserAvatar } from "@/components/data-display/avatars";
import { ProgressBar } from "@/components/data-display/progress";
import { AlertBanner } from "@/components/feedback/alert";
import { NumberInput } from "@/components/forms/number-input";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectMembers } from "@/features/projects";
import { PermissionGuard } from "@/lib/permissions";
import { cn } from "@/lib/utils";

import { useUpdateCapacity } from "../hooks/use-sprints";
import type { SprintMemberCapacity } from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";

export interface CapacityMemberOption {
  userId: string;
  name: string;
}

export interface CapacityPlanningCardProps {
  members: SprintMemberCapacity[];
  capacityPoints: number;
  allocatedPoints: number;
  className?: string;
  /** Shows the Edit affordance and per-row inputs. */
  editable?: boolean;
  /** Project members not yet on the capacity table, offered by the "Add member" picker. */
  memberOptions?: CapacityMemberOption[];
  memberOptionsLoading?: boolean;
  saving?: boolean;
  saveError?: string;
  onSave?: (
    members: Array<{ userId: string; userName: string; capacityPoints: number }>
  ) => void | Promise<void>;
}

function CapacityPlanningCard({
  members,
  capacityPoints,
  allocatedPoints,
  className,
  editable = false,
  memberOptions = [],
  memberOptionsLoading = false,
  saving = false,
  saveError,
  onSave,
}: CapacityPlanningCardProps) {
  const overAllocated = allocatedPoints > capacityPoints;
  const utilization =
    capacityPoints > 0 ? Math.min(100, Math.round((allocatedPoints / capacityPoints) * 100)) : 0;

  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<SprintMemberCapacity[]>(members);
  const [selectedNewMember, setSelectedNewMember] = React.useState<string | null>(null);

  function startEditing() {
    setDraft(members);
    setSelectedNewMember(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setDraft(members);
    setSelectedNewMember(null);
  }

  function updateDraftCapacity(userId: string, value: number | null) {
    setDraft((prev) =>
      prev.map((member) =>
        member.userId === userId ? { ...member, capacityPoints: value ?? 0 } : member
      )
    );
  }

  function removeDraftMember(userId: string) {
    setDraft((prev) => prev.filter((member) => member.userId !== userId));
  }

  function addDraftMember() {
    if (!selectedNewMember) return;
    const candidate = memberOptions.find((member) => member.userId === selectedNewMember);
    if (!candidate) return;
    setDraft((prev) => [
      ...prev,
      {
        userId: candidate.userId,
        name: candidate.name,
        capacityPoints: 0,
        allocatedPoints: 0,
        availability: 100,
      },
    ]);
    setSelectedNewMember(null);
  }

  async function handleSave() {
    if (!onSave) return;
    await onSave(
      draft.map((member) => ({
        userId: member.userId,
        userName: member.name,
        capacityPoints: member.capacityPoints,
      }))
    );
    setIsEditing(false);
  }

  const addableMembers = memberOptions.filter(
    (member) => !draft.some((entry) => entry.userId === member.userId)
  );

  return (
    <Card className={cn(className)} data-slot="capacity-planning-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-base">Team capacity</CardTitle>
        {editable && !isEditing ? (
          <PermissionGuard permission="sprint.update">
            <Button type="button" size="sm" variant="outline" onClick={startEditing}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </PermissionGuard>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {overAllocated ? (
          <AlertBanner
            tone="warning"
            title="Over capacity"
            description={`Allocated ${allocatedPoints} points exceeds team capacity of ${capacityPoints}.`}
            icon={<AlertTriangle className="size-4" />}
          />
        ) : null}

        <ProgressBar
          value={utilization}
          label="Overall utilization"
          tone={overAllocated ? "danger" : utilization > 85 ? "warning" : "success"}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Member</th>
                <th className="pb-2 pr-4 font-medium">Capacity</th>
                <th className="pb-2 pr-4 font-medium">Allocated</th>
                <th className="pb-2 font-medium">Availability</th>
                {isEditing ? <th className="pb-2" /> : null}
              </tr>
            </thead>
            <tbody>
              {(isEditing ? draft : members).map((member) => {
                const memberOver = member.allocatedPoints > member.capacityPoints;
                return (
                  <tr key={member.userId} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={{ name: member.name, imageUrl: member.avatarUrl }} size="sm" />
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">
                      {isEditing ? (
                        <NumberInput
                          value={member.capacityPoints}
                          onChange={(value) => updateDraftCapacity(member.userId, value)}
                          min={0}
                          max={200}
                          showStepper={false}
                          className="w-20"
                        />
                      ) : (
                        member.capacityPoints
                      )}
                    </td>
                    <td
                      className={cn(
                        "py-2.5 pr-4 tabular-nums",
                        memberOver && "font-medium text-danger"
                      )}
                    >
                      {member.allocatedPoints}
                    </td>
                    <td className="py-2.5 tabular-nums">{member.availability}%</td>
                    {isEditing ? (
                      <td className="py-2.5 text-right">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Remove ${member.name}`}
                          onClick={() => removeDraftMember(member.userId)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            <div className="flex flex-wrap items-end gap-2">
              <SelectField
                label="Add member"
                options={addableMembers.map((member) => ({
                  value: member.userId,
                  label: member.name,
                }))}
                value={selectedNewMember}
                onValueChange={setSelectedNewMember}
                placeholder="Select a project member"
                emptyText={memberOptionsLoading ? "Loading members…" : "No members to add"}
                className="min-w-[220px]"
                size="sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!selectedNewMember}
                onClick={addDraftMember}
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={cancelEditing}
              >
                Cancel
              </Button>
            </div>
            {saveError ? <p className="text-sm text-danger">{saveError}</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export interface CapacityPlanningSectionProps {
  sprintId: string;
  projectId: string;
  members: SprintMemberCapacity[];
  capacityPoints: number;
  allocatedPoints: number;
  className?: string;
}

/** Wires `CapacityPlanningCard`'s edit mode to the sprint capacity API. */
function CapacityPlanningSection({
  sprintId,
  projectId,
  members,
  capacityPoints,
  allocatedPoints,
  className,
}: CapacityPlanningSectionProps) {
  const projectMembersQuery = useProjectMembers(projectId);
  const updateCapacity = useUpdateCapacity(sprintId);

  const memberOptions: CapacityMemberOption[] = (projectMembersQuery.data ?? []).map((member) => ({
    userId: member.userId,
    name: member.name,
  }));

  return (
    <CapacityPlanningCard
      members={members}
      capacityPoints={capacityPoints}
      allocatedPoints={allocatedPoints}
      className={className}
      editable
      memberOptions={memberOptions}
      memberOptionsLoading={projectMembersQuery.isLoading}
      saving={updateCapacity.isPending}
      saveError={updateCapacity.error ? toSprintErrorMessage(updateCapacity.error) : undefined}
      onSave={async (nextMembers) => {
        await updateCapacity.mutateAsync(nextMembers);
      }}
    />
  );
}

export { CapacityPlanningCard, CapacityPlanningSection };
