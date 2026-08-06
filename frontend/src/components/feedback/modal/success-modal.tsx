"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "./modal";
import type { SuccessModalProps } from "./types";

/**
 * Celebratory completion modal — success icon, title/description, and an
 * optional single action (defaults to "Continue" which closes the modal).
 */
function SuccessModal({
  open,
  onOpenChange,
  title = "Success",
  description,
  action,
  children,
  className,
}: SuccessModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      showCloseButton={false}
      className={className}
      footer={
        <Button
          type="button"
          variant={action?.variant ?? "default"}
          disabled={action?.disabled}
          onClick={() => {
            action?.onClick?.();
            onOpenChange?.(false);
          }}
          className="w-full sm:w-auto"
        >
          {action?.label ?? "Continue"}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </Modal>
  );
}

export { SuccessModal };
