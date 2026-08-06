"use client";

import { Modal } from "@/components/feedback/modal";

import { AlertRuleForm } from "./alert-rule-form";

export interface CreateAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateAlertModal({ open, onOpenChange }: CreateAlertModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create alert rule"
      description="Notify your team when a metric crosses a threshold."
      size="lg"
    >
      <AlertRuleForm mode="create" onSuccess={() => onOpenChange(false)} />
    </Modal>
  );
}

export { CreateAlertModal };
