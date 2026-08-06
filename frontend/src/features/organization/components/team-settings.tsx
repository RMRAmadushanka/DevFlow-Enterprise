"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { ConfirmModal } from "@/components/feedback/modal";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";
import { SkeletonCard } from "@/components/data-display/skeleton";

import { useDeleteTeam, useTeams } from "../hooks/use-members";
import type { Team } from "../types/member.types";
import { CreateTeamModal } from "./create-team-modal";
import { EditTeamModal } from "./edit-team-modal";
import { TeamCard } from "./team-card";

export interface TeamSettingsProps {
  organizationId: string;
  showHeaderLink?: boolean;
}

function TeamSettings({ organizationId, showHeaderLink = true }: TeamSettingsProps) {
  const { data = [], isLoading, isError } = useTeams(organizationId);
  const deleteTeam = useDeleteTeam(organizationId);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTeam, setEditTeam] = React.useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Team | null>(null);

  return (
    <div className="flex flex-col gap-4" data-slot="team-settings">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Teams</h2>
          <p className="text-sm text-muted-foreground">
            Organize members into delivery groups.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showHeaderLink ? (
            <Button
              render={<Link href={routes.app.organizationTeams(organizationId)} />}
              variant="outline"
              size="sm"
            >
              Open teams page
            </Button>
          ) : null}
          <PermissionGuard permission="team.manage">
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create team
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <FeatureEmptyState
          variant="no-results"
          title="Could not load teams"
          description="Try again in a moment."
        />
      ) : data.length === 0 ? (
        <FeatureEmptyState
          variant="no-data"
          title="No teams"
          description="Create a team to group members for ownership and notifications."
          action={
            <PermissionGuard permission="team.manage">
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Create team
              </Button>
            </PermissionGuard>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={setEditTeam}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreateTeamModal
        organizationId={organizationId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <EditTeamModal
        organizationId={organizationId}
        team={editTeam}
        open={Boolean(editTeam)}
        onOpenChange={(open) => {
          if (!open) setEditTeam(null);
        }}
      />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete team?"
        description={
          deleteTarget ? `Delete “${deleteTarget.name}”? Members stay in the organization.` : undefined
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (!deleteTarget) return;
          void deleteTeam.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null));
        }}
      />
    </div>
  );
}

export { TeamSettings };
