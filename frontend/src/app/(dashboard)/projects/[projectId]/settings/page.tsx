"use client";

import * as React from "react";
import { useParams } from "next/navigation";

import {
  DeleteProjectModal,
  ProjectArchiveModal,
  ProjectDetailShell,
  ProjectSettingsForm,
  TransferOwnershipModal,
} from "@/features/projects";

export default function ProjectSettingsPage() {
  const params = useParams<{ projectId: string }>();
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [transferOpen, setTransferOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <ProjectDetailShell projectId={params.projectId} sidePanel={false}>
      {(project) => (
        <>
          <ProjectSettingsForm
            project={project}
            onArchive={() => setArchiveOpen(true)}
            onTransfer={() => setTransferOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
          <ProjectArchiveModal
            project={project}
            open={archiveOpen}
            onOpenChange={setArchiveOpen}
          />
          <TransferOwnershipModal
            project={project}
            members={project.members}
            open={transferOpen}
            onOpenChange={setTransferOpen}
          />
          <DeleteProjectModal
            project={project}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
          />
        </>
      )}
    </ProjectDetailShell>
  );
}
