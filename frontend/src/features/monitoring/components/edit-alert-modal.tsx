"use client";

import { Modal } from "@/components/feedback/modal";

import type { Alert } from "../types/monitoring.types";
import { AlertHistory } from "./alert-history";
import { AlertRuleForm } from "./alert-rule-form";

export interface EditAlertModalProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditAlertModal({ alert, open, onOpenChange }: EditAlertModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit alert rule"
      description={alert ? `Update thresholds and notifications for ${alert.name}.` : undefined}
      size="lg"
    >
      {alert ? (
        <div className="flex flex-col gap-6">
          <AlertRuleForm
            mode="edit"
            alert={alert}
            onSuccess={() => onOpenChange(false)}
          />
          <AlertHistory alertId={alert.id} />
        </div>
      ) : null}
    </Modal>
  );
}

export { EditAlertModal };
