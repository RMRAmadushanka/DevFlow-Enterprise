"use client";

import { Modal } from "@/components/feedback/modal";

import { RepositoryForm } from "./repository-form";

export interface CreateRepositoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

function CreateRepositoryModal({
  open,
  onOpenChange,
  defaultProjectId,
}: CreateRepositoryModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create repository"
      description="Create a new repository in your workspace."
      size="lg"
    >
      <RepositoryForm mode="create" defaultProjectId={defaultProjectId} compact />
    </Modal>
  );
}

export { CreateRepositoryModal };
