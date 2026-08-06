"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";
import { FormField, FormLabel, FormErrorMessage, FormHint } from "@/components/forms/form-layout";
import { useControllableState, useFieldId } from "@/components/forms/shared/hooks";
import { duration, easing } from "@/design-system/tokens/motion";
import { FileUploadItem } from "./file-upload-item";
import { createUploadFile, formatBytes, isFileAccepted, revokePreview } from "./utils";
import type { FileUploadFieldProps, UploadFile } from "./types";

/**
 * Click-or-drag file upload with per-file progress, cancel, and retry. The
 * actual network transfer is delegated to the optional `uploadFile` prop —
 * without it, files simply become "ready" attachments (still fully usable
 * for e.g. client-side-only flows), keeping this component free of any
 * hardcoded API integration.
 */
function FileUploadField({
  label,
  required,
  disabled,
  error,
  helperText,
  size = "md",
  className,
  id,
  value,
  onValueChange,
  uploadFile,
  accept,
  multiple = true,
  maxFiles,
  maxSizeBytes,
  showPreviews = true,
}: FileUploadFieldProps) {
  const controlId = useFieldId(id);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortControllers = React.useRef(new Map<string, AbortController>());
  const [isDragging, setIsDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const [files, setFiles] = useControllableState<UploadFile[]>({
    value,
    defaultValue: [],
    onChange: onValueChange,
  });

  function runUpload(entry: UploadFile) {
    if (!uploadFile) {
      setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: "success", progress: 100 } : f)));
      return;
    }

    const controller = new AbortController();
    abortControllers.current.set(entry.id, controller);
    setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading", progress: 0, error: undefined } : f)));

    uploadFile(
      entry.file,
      (percent) => setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, progress: percent } : f))),
      controller.signal
    )
      .then(() => {
        setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: "success", progress: 100 } : f)));
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: "cancelled" } : f)));
          return;
        }
        const message = err instanceof Error ? err.message : "Upload failed";
        setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: "error", error: message } : f)));
      })
      .finally(() => abortControllers.current.delete(entry.id));
  }

  function addFiles(fileList: FileList | File[]) {
    setLocalError(null);
    const incoming = Array.from(fileList);
    const remainingSlots = maxFiles ? Math.max(0, maxFiles - files.length) : Infinity;

    if (incoming.length > remainingSlots) {
      setLocalError(`You can only upload up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`);
    }

    const accepted: UploadFile[] = [];
    for (const file of incoming.slice(0, remainingSlots)) {
      if (!isFileAccepted(file, accept)) {
        setLocalError(`"${file.name}" isn't an accepted file type.`);
        continue;
      }
      if (maxSizeBytes && file.size > maxSizeBytes) {
        setLocalError(`"${file.name}" exceeds the ${formatBytes(maxSizeBytes)} size limit.`);
        continue;
      }
      accepted.push(createUploadFile(file, showPreviews));
    }

    if (accepted.length === 0) return;
    setFiles((prev) => [...prev, ...accepted]);
    accepted.forEach(runUpload);
  }

  function removeFile(fileId: string) {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === fileId);
      if (target) revokePreview(target);
      return prev.filter((f) => f.id !== fileId);
    });
  }

  function cancelFile(fileId: string) {
    abortControllers.current.get(fileId)?.abort();
  }

  function retryFile(fileId: string) {
    const entry = files.find((f) => f.id === fileId);
    if (entry) runUpload(entry);
  }

  React.useEffect(() => {
    return () => files.forEach(revokePreview);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup-only: revoke object URLs on unmount
  }, []);

  return (
    <FormField invalid={!!error} disabled={disabled} className={cn("gap-1.5", className)}>
      {label ? (
        <FormLabel htmlFor={controlId} required={required}>
          {label}
        </FormLabel>
      ) : null}

      <motion.button
        id={controlId}
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
        }}
        animate={{ scale: isDragging ? 1.01 : 1 }}
        transition={{ duration: duration.instant, ease: easing.standard }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-transparent px-4 py-8 text-center transition-colors hover:border-ring/60 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          isDragging && "border-ring bg-primary-muted",
          size === "sm" && "py-5"
        )}
      >
        <UploadCloud className="size-6 text-muted-foreground" aria-hidden="true" />
        <div className="text-sm text-foreground">
          <span className="font-medium text-primary">Click to upload</span> or drag and drop
        </div>
        {accept || maxSizeBytes ? (
          <p className="text-xs text-muted-foreground">
            {accept ? accept.replace(/\./g, "").toUpperCase() : "Any file"}
            {maxSizeBytes ? ` · up to ${formatBytes(maxSizeBytes)}` : ""}
          </p>
        ) : null}
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {files.map((f) => (
              <FileUploadItem
                key={f.id}
                uploadFile={f}
                showPreview={showPreviews}
                onRemove={() => removeFile(f.id)}
                onCancel={() => cancelFile(f.id)}
                onRetry={() => retryFile(f.id)}
              />
            ))}
          </AnimatePresence>
        </ul>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        {error || localError ? (
          <FormErrorMessage key="error">{error ?? localError}</FormErrorMessage>
        ) : helperText ? (
          <FormHint key="hint">{helperText}</FormHint>
        ) : null}
      </AnimatePresence>
    </FormField>
  );
}

export { FileUploadField };
