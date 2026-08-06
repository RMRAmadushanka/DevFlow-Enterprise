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

import { useDeleteDocument } from "../hooks/use-documents";
import {
  deleteDocumentSchema,
  type DeleteDocumentFormValues,
} from "../schemas/document.schema";
import type { Document as DocumentEntity } from "../types/document.types";
import { toDocumentErrorMessage } from "../utils/errors";

export interface DeleteDocumentModalProps {
  document: DocumentEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteDocumentModal({ document: doc, open, onOpenChange }: DeleteDocumentModalProps) {
  const remove = useDeleteDocument();

  const form = useAppForm({
    schema: deleteDocumentSchema,
    defaultValues: {
      confirmation: "",
    } satisfies DeleteDocumentFormValues,
    onSubmit: async (values) => {
      if (!doc) return;
      if (values.confirmation !== "DELETE") {
        form.setError("confirmation", { message: 'Type "DELETE" to confirm' });
        return;
      }
      await remove.mutateAsync(doc.id);
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete document?"
      description={
        doc
          ? `Type DELETE to move “${doc.title}” to trash. You can restore it later from Trash.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || remove.error ? (
          <AlertBanner
            tone="error"
            title="Delete failed"
            description={toDocumentErrorMessage(form.submitError || remove.error)}
          />
        ) : null}
        <FormController
          name="confirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label='Type "DELETE" to confirm'
              placeholder="DELETE"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || remove.isPending}
          loadingText="Deleting…"
          variant="destructive"
        >
          Delete document
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { DeleteDocumentModal };
