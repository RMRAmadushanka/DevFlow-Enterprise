"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "./modal";
import type { FormModalProps } from "./types";

/**
 * Modal chrome for create/edit flows — cancel + submit actions with
 * submitting/loading states. Put the form fields in `children`.
 */
function FormModal({
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
  submitting,
  loading,
  onOpenChange,
  footer,
  ...props
}: FormModalProps) {
  const busy = Boolean(submitting || loading);

  async function handleSubmit() {
    await onSubmit?.();
  }

  function handleCancel() {
    onCancel?.();
    onOpenChange?.(false);
  }

  return (
    <Modal
      {...props}
      loading={busy}
      onOpenChange={onOpenChange}
      footer={
        footer ?? (
          <>
            <Button type="button" variant="outline" disabled={busy} onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button type="button" disabled={busy} onClick={() => void handleSubmit()}>
              {submitLabel}
            </Button>
          </>
        )
      }
    />
  );
}

export { FormModal };
