"use client";

import { Modal } from "@/components/feedback/modal";

import { RepositoryForm } from "./repository-form";

export interface ConnectRepositoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

function ConnectRepositoryModal({
  open,
  onOpenChange,
  defaultProjectId,
}: ConnectRepositoryModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Connect repository"
      description="Link an existing remote repository to DevFlow."
      size="lg"
    >
      <RepositoryForm mode="connect" defaultProjectId={defaultProjectId} compact />
    </Modal>
  );
}

export { ConnectRepositoryModal };
