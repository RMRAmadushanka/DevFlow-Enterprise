"use client";

import { UserAvatar } from "@/components/data-display/avatars";
import { FeatureEmptyState } from "@/components/architecture/empty";

import type { OrganizationMember } from "../types/member.types";
import { RoleBadge } from "./role-badge";

export interface TeamMemberListProps {
  members: OrganizationMember[];
}

function TeamMemberList({ members }: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No team members"
        description="Assign members when creating or editing this team."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Team members">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
        >
          <UserAvatar user={{ name: member.name, imageUrl: member.avatarUrl }} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{member.name}</p>
            <p className="truncate text-xs text-muted-foreground">{member.email}</p>
          </div>
          <RoleBadge role={member.role} size="sm" />
        </li>
      ))}
    </ul>
  );
}

export { TeamMemberList };
