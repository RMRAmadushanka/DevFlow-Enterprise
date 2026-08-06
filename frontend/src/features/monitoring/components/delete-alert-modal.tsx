"use client";

import { ConfirmModal } from "@/components/feedback/modal";

import { useDeleteAlert } from "../hooks/use-monitoring";
import type { Alert } from "../types/monitoring.types";

export interface DeleteAlertModalProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteAlertModal({ alert, open, onOpenChange }: DeleteAlertModalProps) {
  const remove = useDeleteAlert();

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      variant="danger"
      title="Delete alert rule?"
      description={
        alert
          ? `Permanently remove “${alert.name}”. Trigger history will no longer be available.`
          : undefined
      }
      confirmLabel="Delete alert"
      loading={remove.isPending}
      onConfirm={async () => {
        if (!alert) return;
        await remove.mutateAsync(alert.id);
        onOpenChange(false);
      }}
    />
  );
}

export { DeleteAlertModal };
