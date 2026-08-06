"use client";

import * as React from "react";

import { ImageUploadField } from "@/components/forms/image-upload";

export interface AvatarUploadProps {
  value?: string | null;
  onChange: (nextUrl: string | null) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Profile avatar picker — local object URLs for mock uploads (no backend).
 */
function AvatarUpload({ value, onChange, disabled, error }: AvatarUploadProps) {
  return (
    <ImageUploadField
      label="Avatar"
      helperText="PNG or JPG up to 2MB"
      shape="circle"
      previewSize={96}
      accept="image/png,image/jpeg,image/webp"
      maxSizeBytes={2 * 1024 * 1024}
      value={value}
      disabled={disabled}
      error={error}
      onValueChange={(file) => {
        if (!file) {
          onChange(null);
          return;
        }
        const url = URL.createObjectURL(file);
        onChange(url);
      }}
    />
  );
}

export { AvatarUpload };
