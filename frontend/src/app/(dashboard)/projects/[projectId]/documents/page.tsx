"use client";

import { useParams } from "next/navigation";

import { DocumentsView } from "@/features/documents";
import { ProjectDetailShell } from "@/features/projects";

export default function ProjectDocumentsPage() {
  const params = useParams<{ projectId: string }>();

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <DocumentsView
          projectId={project.id}
          title={`${project.name} documents`}
          description="Knowledge base pages scoped to this project."
        />
      )}
    </ProjectDetailShell>
  );
}
