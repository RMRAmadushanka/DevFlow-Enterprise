"use client";

import * as React from "react";
import { AlertTriangle, Info, OctagonAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "./modal";
import type { ConfirmModalProps } from "./types";

const variantConfig = {
  danger: {
    icon: OctagonAlert,
    confirmVariant: "destructive" as const,
    iconClass: "bg-destructive/10 text-destructive",
  },
  error: {
    icon: OctagonAlert,
    confirmVariant: "destructive" as const,
    iconClass: "bg-destructive/10 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    confirmVariant: "default" as const,
    iconClass: "bg-warning/10 text-warning",
  },
  info: {
    icon: Info,
    confirmVariant: "default" as const,
    iconClass: "bg-info/10 text-info",
  },
};

/**
 * Confirmation dialog for destructive or irreversible actions —
 * Cancel + Confirm with danger/warning/info chrome.
 */
function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  variant = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  icon,
  loading,
  className,
}: ConfirmModalProps) {
  const config = variantConfig[variant === "error" ? "danger" : variant];
  const Icon = config.icon;
  const [busy, setBusy] = React.useState(false);
  const isBusy = busy || loading;

  async function handleConfirm() {
    if (!onConfirm) {
      onOpenChange?.(false);
      return;
    }
    try {
      setBusy(true);
      await onConfirm();
      onOpenChange?.(false);
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    onCancel?.();
    onOpenChange?.(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      loading={isBusy}
      showCloseButton={false}
      className={className}
      footer={
        <>
          <Button type="button" variant="outline" disabled={isBusy} onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            disabled={isBusy}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center sm:items-start sm:text-left">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            config.iconClass
          )}
          aria-hidden="true"
        >
          {icon ?? <Icon className="size-5" />}
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export { ConfirmModal };
