"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { UserAvatar } from "@/components/data-display/avatars";
import { StatusBadge } from "@/components/data-display/badges";
import { DataTable } from "@/components/data-display/table";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/feedback/modal";
import { PermissionGuard } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";
import { MoreHorizontal } from "lucide-react";

import {
  useChangeMemberRole,
  useInvitations,
  useMembers,
  useRemoveMember,
  useResendInvitation,
} from "../hooks/use-members";
import type { OrganizationMember } from "../types/member.types";
import { MemberCard } from "./member-card";
import { MemberTableSkeleton } from "./skeletons";
import { RoleBadge } from "./role-badge";

const STATUS_TONE = {
  active: "success",
  invited: "warning",
  suspended: "danger",
} as const;

export interface MemberTableProps {
  organizationId: string;
}

function MemberTable({ organizationId }: MemberTableProps) {
  const { data = [], isLoading, isError } = useMembers(organizationId);
  const { data: invitations = [] } = useInvitations(organizationId);
  const changeRole = useChangeMemberRole(organizationId);
  const removeMember = useRemoveMember(organizationId);
  const resend = useResendInvitation(organizationId);
  const [pendingRemove, setPendingRemove] = React.useState<OrganizationMember | null>(null);

  const handleResend = React.useCallback(
    (member: OrganizationMember) => {
      const invite = invitations.find((item) => item.email === member.email && item.status === "pending");
      if (invite) void resend.mutateAsync(invite.id);
    },
    [invitations, resend]
  );

  const columns = React.useMemo<ColumnDef<OrganizationMember>[]>(
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={STATUS_TONE[row.original.status]} size="sm">
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PermissionGuard permission="member.update">
                {(["admin", "manager", "developer", "viewer"] as Role[]).map((role) => (
                  <DropdownMenuItem
                    key={role}
                    disabled={row.original.role === "owner" || changeRole.isPending}
                    onClick={() =>
                      void changeRole.mutateAsync({ memberId: row.original.id, role })
                    }
                  >
                    Make {role}
                  </DropdownMenuItem>
                ))}
              </PermissionGuard>
              {row.original.status === "invited" ? (
                <PermissionGuard permission="member.invite">
                  <DropdownMenuItem onClick={() => handleResend(row.original)}>
                    Resend invitation
                  </DropdownMenuItem>
                </PermissionGuard>
              ) : null}
              <PermissionGuard permission="member.remove">
                <DropdownMenuItem
                  variant="destructive"
                  disabled={row.original.role === "owner"}
                  onClick={() => setPendingRemove(row.original)}
                >
                  Remove
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [changeRole, handleResend]
  );

  if (isLoading) return <MemberTableSkeleton />;

  if (isError) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Could not load members"
        description="Check your connection and try again."
      />
    );
  }

  if (data.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No members"
        description="Invite teammates to collaborate in this organization."
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          enablePagination
          enableSorting
          density="compact"
          noun="members"
        />
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onChangeRole={(item, role) =>
              void changeRole.mutateAsync({ memberId: item.id, role })
            }
            onRemove={setPendingRemove}
            onResend={handleResend}
          />
        ))}
      </div>

      <ConfirmModal
        open={Boolean(pendingRemove)}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null);
        }}
        title="Remove member?"
        description={
          pendingRemove
            ? `${pendingRemove.name} will lose access to this organization.`
            : undefined
        }
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (!pendingRemove) return;
          void removeMember.mutateAsync(pendingRemove.id).then(() => setPendingRemove(null));
        }}
      />
    </>
  );
}

export { MemberTable };
