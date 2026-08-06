import type * as React from "react";
import type { FeedbackAction, FeedbackTone, OverlayOpenProps, OverlaySize } from "@/components/feedback/shared/types";

export interface ModalProps extends OverlayOpenProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: OverlaySize;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Show the top-right close control. @default true */
  showCloseButton?: boolean;
  /** Close when the overlay is clicked. @default true */
  closeOnOverlayClick?: boolean;
  className?: string;
}

export interface FormModalProps extends ModalProps {
  /** Primary submit action (usually the form's submit button). */
  submitLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  /** Disables submit while true. Prefer over `loading` when the form owns busy state. */
  submitting?: boolean;
}

export interface ConfirmModalProps extends OverlayOpenProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** @default "danger" */
  variant?: Extract<FeedbackTone, "error" | "warning" | "info"> | "danger";
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export interface SuccessModalProps extends OverlayOpenProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: FeedbackAction;
  children?: React.ReactNode;
  className?: string;
}
