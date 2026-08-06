"use client";

import { UserAvatar } from "@/components/data-display/avatars";
import { StatusBadge } from "@/components/data-display/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MEMBER_ROLE_LABELS } from "../constants/repository.constants";
import type { RepositoryMember } from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";

export interface RepositoryMembersProps {
  members: RepositoryMember[];
}

function RepositoryMembers({ members }: RepositoryMembersProps) {
  return (
    <Card data-slot="repository-members">
      <CardHeader>
        <CardTitle className="text-base">Members</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    user={{
                      id: member.userId,
                      name: member.name,
                      imageUrl: member.avatarUrl,
                    }}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatRelativeCommitDate(member.joinedAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge tone="neutral" size="sm">
                  {MEMBER_ROLE_LABELS[member.role]}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { RepositoryMembers };
