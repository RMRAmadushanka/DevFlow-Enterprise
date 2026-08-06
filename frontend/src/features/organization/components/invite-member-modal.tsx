"use client";

import { Modal } from "@/components/feedback/modal";

import { InviteMemberForm } from "./invite-member-form";

export interface InviteMemberModalProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InviteMemberModal({ organizationId, open, onOpenChange }: InviteMemberModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Invite member"
      description="Send an email invitation with a role and optional team assignment."
    >
      <InviteMemberForm
        organizationId={organizationId}
        onSuccess={() => onOpenChange(false)}
      />
    </Modal>
  );
}

export { InviteMemberModal };
