"use client";

import * as React from "react";

import { ConfirmModal } from "@/components/feedback/modal";
import type { ApiKeyRecord } from "../types/auth.types";

export interface RevokeKeyModalProps {
  apiKey: ApiKeyRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

function RevokeKeyModal({
  apiKey,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: RevokeKeyModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      variant="danger"
      title="Revoke API key?"
      description={
        apiKey
          ? `“${apiKey.name}” (${apiKey.prefix}…) will stop working immediately.`
          : "This key will stop working immediately."
      }
      confirmLabel="Revoke"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

export { RevokeKeyModal };
