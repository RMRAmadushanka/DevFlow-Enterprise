"use client";

import { Modal } from "@/components/feedback/modal";

import { DocumentForm } from "./document-form";

export interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFolderId?: string | null;
  defaultTemplateId?: string | null;
}

function CreateDocumentModal({
  open,
  onOpenChange,
  defaultFolderId,
  defaultTemplateId,
}: CreateDocumentModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New document"
      description="Create a document from a blank page or template."
    >
      <DocumentForm
        mode="create"
        compact
        defaultFolderId={defaultFolderId}
        defaultTemplateId={defaultTemplateId}
      />
    </Modal>
  );
}

export { CreateDocumentModal };
