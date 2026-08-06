"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { FileCard } from "@/components/data-display/file-preview";
import { formatBytes } from "@/components/data-display/shared/formatters";
import { FileUploadField } from "@/components/forms/file-upload";
import type { UploadFile } from "@/components/forms/file-upload";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import { useRemoveAttachment, useUploadAttachment } from "../hooks/use-tasks";
import type { TaskAttachment } from "../types/task.types";
import { TaskEmptyState } from "./task-empty-state";

export interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  readOnly?: boolean;
}

function toUploadFile(attachment: TaskAttachment): UploadFile {
  return {
    id: attachment.id,
    file: new File([], attachment.name, { type: attachment.mimeType }),
    status: "success",
    progress: 100,
  };
}

function TaskAttachments({ taskId, attachments, readOnly }: TaskAttachmentsProps) {
  const upload = useUploadAttachment(taskId);
  const remove = useRemoveAttachment(taskId);
  const [files, setFiles] = React.useState<UploadFile[]>([]);

  React.useEffect(() => {
    setFiles(attachments.map(toUploadFile));
  }, [attachments]);

  async function handleUploadChange(next: UploadFile[]) {
    const added = next.filter(
      (file) => file.status !== "success" && !attachments.some((a) => a.id === file.id)
    );
    setFiles(next);
    for (const file of added) {
      if (file.status === "uploading" || file.status === "success") continue;
      await upload.mutateAsync({
        name: file.file.name,
        size: file.file.size,
        mimeType: file.file.type || "application/octet-stream",
      });
    }
  }

  if (attachments.length === 0 && readOnly) {
    return <TaskEmptyState variant="no-attachments" />;
  }

  return (
    <div className="space-y-4" data-slot="task-attachments">
      {!readOnly ? (
        <PermissionGuard permission="task.update">
          <FileUploadField
            label="Upload files"
            value={files}
            onValueChange={(next) => void handleUploadChange(next)}
            multiple
            maxFiles={10}
          />
        </PermissionGuard>
      ) : null}

      {attachments.length > 0 ? (
        <ul className="space-y-2" aria-label="Attachments">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <FileCard
                file={{
                  name: attachment.name,
                  sizeBytes: attachment.size,
                  mimeType: attachment.mimeType,
                }}
                actions={
                  !readOnly ? (
                    <PermissionGuard permission="task.update">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove ${attachment.name}`}
                        onClick={() => void remove.mutateAsync(attachment.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </PermissionGuard>
                  ) : undefined
                }
                onClick={() => window.open(attachment.url, "_blank", "noreferrer")}
              />
              <p className="mt-0.5 pl-1 text-xs text-muted-foreground">
                {formatBytes(attachment.size)} · {attachment.uploadedBy}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <TaskEmptyState variant="no-attachments" />
      )}
    </div>
  );
}

export { TaskAttachments };
