"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useRestoreVersion } from "../hooks/use-documents";
import {
  restoreVersionSchema,
  type RestoreVersionFormValues,
} from "../schemas/document.schema";
import type { DocumentVersion } from "../types/document.types";
import { toDocumentErrorMessage } from "../utils/errors";

export interface RestoreVersionModalProps {
  documentId: string;
  version: DocumentVersion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RestoreVersionModal({
  documentId,
  version,
  open,
  onOpenChange,
}: RestoreVersionModalProps) {
  const restore = useRestoreVersion(documentId);

  const form = useAppForm({
    schema: restoreVersionSchema,
    defaultValues: {
      confirmation: "",
    } satisfies RestoreVersionFormValues,
    onSubmit: async (values) => {
      if (!version) return;
      if (values.confirmation !== "RESTORE") {
        form.setError("confirmation", { message: 'Type "RESTORE" to confirm' });
        return;
      }
      await restore.mutateAsync(version.id);
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Restore version?"
      description={
        version
          ? `Type RESTORE to replace the current content with version ${version.version}.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || restore.error ? (
          <AlertBanner
            tone="error"
            title="Restore failed"
            description={toDocumentErrorMessage(form.submitError || restore.error)}
          />
        ) : null}
        <FormController
          name="confirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label='Type "RESTORE" to confirm'
              placeholder="RESTORE"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || restore.isPending}
          loadingText="Restoring…"
        >
          Restore version
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { RestoreVersionModal };
