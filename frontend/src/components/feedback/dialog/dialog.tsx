"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/feedback/modal";
import type { QuickDialogProps } from "./types";

/**
 * Lightweight information / quick-action dialog. Prefer `ConfirmModal` for
 * destructive confirmations and `Modal`/`FormModal` for richer content.
 */
function QuickDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  action,
  dismissLabel = "Close",
  loading,
  className,
}: QuickDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      loading={loading}
      className={className}
      footer={
        <>
          <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange?.(false)}>
            {dismissLabel}
          </Button>
          {action ? (
            <Button
              type="button"
              variant={action.variant ?? "default"}
              disabled={loading || action.disabled}
              onClick={() => {
                action.onClick?.();
                onOpenChange?.(false);
              }}
            >
              {action.label}
            </Button>
          ) : null}
        </>
      }
    >
      {children}
    </Modal>
  );
}

export { QuickDialog };
