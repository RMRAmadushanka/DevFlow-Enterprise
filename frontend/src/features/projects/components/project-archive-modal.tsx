"use client";

import { ConfirmModal } from "@/components/feedback/modal";

import { useArchiveProject } from "../hooks/use-projects";
import type { Project } from "../types/project.types";

export interface ProjectArchiveModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProjectArchiveModal({ project, open, onOpenChange }: ProjectArchiveModalProps) {
  const archive = useArchiveProject();

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Archive project?"
      description={
        project
          ? `${project.name} will be hidden from active lists. You can restore it later from archived projects.`
          : undefined
      }
      confirmLabel="Archive"
      variant="danger"
      loading={archive.isPending}
      onConfirm={() => {
        if (!project) return;
        void archive.mutateAsync(project.id).then(() => onOpenChange(false));
      }}
    />
  );
}

export { ProjectArchiveModal };
