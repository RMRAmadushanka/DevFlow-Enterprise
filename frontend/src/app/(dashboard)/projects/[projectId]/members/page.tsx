"use client";

import { useParams } from "next/navigation";

import { ProjectDetailShell, ProjectMembers } from "@/features/projects";

export default function ProjectMembersPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId}>
      {(project) => <ProjectMembers members={project.members} />}
    </ProjectDetailShell>
  );
}
