"use client";

import * as React from "react";

import { Toaster } from "@/components/ui/sonner";

export interface ToastProviderProps {
  /** Preferred corner. @default "bottom-right" */
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  /** Max visible toasts. @default 4 */
  visibleToasts?: number;
  /** Show a countdown bar on timed toasts. @default true */
  closeButton?: boolean;
  richColors?: boolean;
}

/**
 * Global toast host. Mount once in the root layout alongside the theme
 * provider. Imperative API: `import { toast } from "@/components/feedback/toast"`.
 */
function ToastProvider({
  position = "bottom-right",
  visibleToasts = 4,
  closeButton = true,
  richColors = true,
}: ToastProviderProps) {
  return (
    <Toaster
      position={position}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      richColors={richColors}
      expand
    />
  );
}

export { ToastProvider };
