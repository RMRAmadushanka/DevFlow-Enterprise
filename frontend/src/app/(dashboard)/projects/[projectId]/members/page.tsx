"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import {
  InviteProjectMemberModal,
  ProjectDetailShell,
  ProjectMembers,
  useProjectMembers,
} from "@/features/projects";

export default function ProjectMembersPage() {
  const params = useParams<{ projectId: string }>();
  const membersQuery = useProjectMembers(params.projectId);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {() => (
        <>
          <ProjectMembers
            members={membersQuery.data ?? []}
            loading={membersQuery.isLoading}
            onInvite={() => setInviteOpen(true)}
          />
          <InviteProjectMemberModal
            projectId={params.projectId}
            open={inviteOpen}
            onOpenChange={setInviteOpen}
          />
        </>
      )}
    </ProjectDetailShell>
  );
}
