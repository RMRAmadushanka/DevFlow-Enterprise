"use client";

import { ConfirmModal } from "@/components/feedback/modal";

import { useArchiveRepository } from "../hooks/use-repositories";
import type { Repository as RepositoryEntity } from "../types/repository.types";

export interface ArchiveRepositoryModalProps {
  repository: RepositoryEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ArchiveRepositoryModal({
  repository,
  open,
  onOpenChange,
}: ArchiveRepositoryModalProps) {
  const archive = useArchiveRepository();

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Archive repository?"
      description={
        repository
          ? `${repository.name} will be hidden from active lists. You can restore it later.`
          : undefined
      }
      confirmLabel="Archive"
      variant="danger"
      loading={archive.isPending}
      onConfirm={() => {
        if (!repository) return;
        void archive.mutateAsync(repository.id).then(() => onOpenChange(false));
      }}
    />
  );
}

export { ArchiveRepositoryModal };
