"use client";

import { MoreHorizontal } from "lucide-react";

import { UserAvatar } from "@/components/data-display/avatars";
import { StatusBadge } from "@/components/data-display/badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";

import type { OrganizationMember } from "../types/member.types";
import { RoleBadge } from "./role-badge";

const STATUS_TONE = {
  active: "success",
  invited: "warning",
  suspended: "danger",
} as const;

export interface MemberCardProps {
  member: OrganizationMember;
  onChangeRole?: (member: OrganizationMember, role: Role) => void;
  onRemove?: (member: OrganizationMember) => void;
  onResend?: (member: OrganizationMember) => void;
}

function MemberCard({ member, onChangeRole, onRemove, onResend }: MemberCardProps) {
  return (
    <article
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
      data-slot="member-card"
    >
      <UserAvatar user={{ name: member.name, imageUrl: member.avatarUrl }} size="default" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{member.name}</p>
            <p className="truncate text-sm text-muted-foreground">{member.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" size="icon-sm" variant="ghost" aria-label={`Actions for ${member.name}`} />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PermissionGuard permission="member.update">
                {(["admin", "manager", "developer", "viewer"] as const).map((role) => (
                  <DropdownMenuItem key={role} onClick={() => onChangeRole?.(member, role)}>
                    Make {role}
                  </DropdownMenuItem>
                ))}
              </PermissionGuard>
              {member.status === "invited" ? (
                <PermissionGuard permission="member.invite">
                  <DropdownMenuItem onClick={() => onResend?.(member)}>Resend invitation</DropdownMenuItem>
                </PermissionGuard>
              ) : null}
              <PermissionGuard permission="member.remove">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRemove?.(member)}
                  disabled={member.role === "owner"}
                >
                  Remove
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <RoleBadge role={member.role} size="sm" />
          <StatusBadge tone={STATUS_TONE[member.status]} size="sm">
            {member.status}
          </StatusBadge>
        </div>
      </div>
    </article>
  );
}

export { MemberCard };
