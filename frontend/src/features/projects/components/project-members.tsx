"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { UserAvatar } from "@/components/data-display/avatars";
import { DataTable } from "@/components/data-display/table";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { ProgressBar } from "@/components/data-display/progress";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { RoleBadge } from "@/features/organization";

import type { ProjectMember } from "../types/project.types";
import { ProjectEmptyState } from "./project-empty-state";

export interface ProjectMembersProps {
  members: ProjectMember[];
  loading?: boolean;
  onInvite?: () => void;
}

function MemberCard({ member }: { member: ProjectMember }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <UserAvatar user={{ name: member.name, imageUrl: member.avatarUrl }} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{member.name}</p>
          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RoleBadge role={member.role} size="sm" />
            <span className="text-xs text-muted-foreground">
              Active {formatRelativeTime(member.lastActiveAt)}
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Capacity</span>
              <span>{member.capacity}%</span>
            </div>
            <ProgressBar value={member.capacity} size="sm" />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectMembers({ members, loading, onInvite }: ProjectMembersProps) {
  const columns = React.useMemo<ColumnDef<ProjectMember>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar
              user={{ name: row.original.name, imageUrl: row.original.avatarUrl }}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleBadge role={row.original.role} size="sm" />,
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
          <div className="w-24 space-y-1">
            <ProgressBar value={row.original.capacity} size="sm" />
            <p className="text-xs tabular-nums text-muted-foreground">{row.original.capacity}%</p>
          </div>
        ),
      },
      {
        accessorKey: "lastActiveAt",
        header: "Last activity",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(String(getValue()))}
          </span>
        ),
      },
    ],
    []
  );

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted" aria-busy="true" />;
  }

  if (members.length === 0) {
    return (
      <ProjectEmptyState
        variant="no-members"
        action={
          <PermissionGuard permission="project.update">
            <Button type="button" onClick={onInvite}>
              Invite member
            </Button>
          </PermissionGuard>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4" data-slot="project-members">
      <div className="flex justify-end">
        <PermissionGuard permission="project.update">
          <Button type="button" variant="outline" size="sm" onClick={onInvite}>
            Invite member
          </Button>
        </PermissionGuard>
      </div>
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={members}
          getRowId={(row) => row.id}
          enablePagination={members.length > 10}
          density="compact"
          noun="members"
        />
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

export { ProjectMembers };
