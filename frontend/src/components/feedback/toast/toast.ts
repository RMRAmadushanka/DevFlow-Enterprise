import { toast as sonnerToast, type ExternalToast } from "sonner";

import type { FeedbackTone } from "@/components/feedback/shared/types";

export interface ToastOptions {
  description?: string;
  /** Auto-dismiss duration in ms. Pass `Infinity` to keep until dismissed. @default 4000 */
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  id?: string | number;
}

type ToastTone = Exclude<FeedbackTone, "neutral">;

function callTone(tone: ToastTone, title: string, options?: ToastOptions) {
  const extras: ExternalToast = {
    description: options?.description,
    duration: options?.duration,
    id: options?.id,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  };

  switch (tone) {
    case "success":
      return sonnerToast.success(title, extras);
    case "error":
      return sonnerToast.error(title, extras);
    case "warning":
      return sonnerToast.warning(title, extras);
    case "info":
      return sonnerToast.info(title, extras);
  }
}

/**
 * Typed toast helpers over Sonner. Mount `<ToastProvider />` once near the
 * app root (typically next to the theme provider).
 */
export const toast = {
  success: (title: string, options?: ToastOptions) => callTone("success", title, options),
  error: (title: string, options?: ToastOptions) => callTone("error", title, options),
  warning: (title: string, options?: ToastOptions) => callTone("warning", title, options),
  info: (title: string, options?: ToastOptions) => callTone("info", title, options),
  loading: (title: string, options?: Omit<ToastOptions, "action">) =>
    sonnerToast.loading(title, {
      description: options?.description,
      duration: options?.duration,
      id: options?.id,
    }),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  message: (title: string, options?: ToastOptions) =>
    sonnerToast(title, {
      description: options?.description,
      duration: options?.duration,
      id: options?.id,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    }),
  promise: sonnerToast.promise,
};
