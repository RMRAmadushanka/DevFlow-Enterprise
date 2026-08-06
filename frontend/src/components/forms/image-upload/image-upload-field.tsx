"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Crop, ImageIcon, Trash2, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormErrorMessage, FormHint } from "@/components/forms/form-layout";
import { useControllableState, useFieldId } from "@/components/forms/shared/hooks";
import { isFileAccepted, formatBytes } from "@/components/forms/file-upload/utils";
import { duration, easing } from "@/design-system/tokens/motion";
import type { ImageUploadFieldProps } from "./types";

/** Single-image picker: click/drag to select, hover to replace/remove, with an optional "Crop" affordance for a caller-supplied cropper. */
function ImageUploadField({
  label,
  required,
  disabled,
  error,
  helperText,
  className,
  id,
  value,
  defaultValue = null,
  onValueChange,
  accept = "image/*",
  maxSizeBytes,
  shape = "square",
  previewSize = 96,
  onCropRequested,
}: ImageUploadFieldProps) {
  const controlId = useFieldId(id);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  const [current, setCurrent] = useControllableState<string | File | null>({
    value,
    defaultValue,
    onChange: (next) => onValueChange?.(next instanceof File ? next : null),
  });

  React.useEffect(() => {
    if (current instanceof File) {
      const url = URL.createObjectURL(current);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [current]);

  const previewUrl = current instanceof File ? objectUrl : current;

  function handleFile(file: File) {
    setLocalError(null);
    if (!isFileAccepted(file, accept)) {
      setLocalError("That file type isn't supported.");
      return;
    }
    if (maxSizeBytes && file.size > maxSizeBytes) {
      setLocalError(`Image exceeds the ${formatBytes(maxSizeBytes)} size limit.`);
      return;
    }
    setCurrent(file);
  }

  return (
    <FormField invalid={!!error} disabled={disabled} className={cn("gap-1.5", className)}>
      {label ? (
        <FormLabel htmlFor={controlId} required={required}>
          {label}
        </FormLabel>
      ) : null}

      <div className="flex items-center gap-4">
        <motion.div
          role="button"
          id={controlId}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file && !disabled) handleFile(file);
          }}
          animate={{ scale: isDragging ? 1.03 : 1 }}
          transition={{ duration: duration.instant, ease: easing.standard }}
          style={{ width: previewSize, height: previewSize }}
          className={cn(
            "group/image relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-input bg-muted/40 transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            shape === "circle" ? "rounded-full" : "rounded-lg",
            isDragging && "border-ring bg-primary-muted",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- object/remote preview URL, not a static asset
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
          )}

          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/70 opacity-0 backdrop-blur-[1px] transition-opacity group-hover/image:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Replace image"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <Upload className="size-3.5" />
              </Button>
              {onCropRequested ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Crop image"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (current instanceof File) onCropRequested(current);
                  }}
                >
                  <Crop className="size-3.5" />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Remove image"
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrent(null);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ) : null}
        </motion.div>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = "";
          }}
        />

        {!previewUrl ? (
          <div className="flex flex-col gap-1">
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
              <Upload className="size-3.5" />
              Upload image
            </Button>
            {accept || maxSizeBytes ? (
              <p className="text-xs text-muted-foreground">
                {accept.replace(/image\/|\*/g, "") || "Any image"}
                {maxSizeBytes ? ` · up to ${formatBytes(maxSizeBytes)}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {error || localError ? (
        <FormErrorMessage>{error ?? localError}</FormErrorMessage>
      ) : helperText ? (
        <FormHint>{helperText}</FormHint>
      ) : null}
    </FormField>
  );
}

export { ImageUploadField };
