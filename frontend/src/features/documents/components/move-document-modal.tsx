"use client";

import * as React from "react";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { SelectField } from "@/components/forms/select";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { FOLDER_OPTIONS } from "../constants/document.constants";
import { useMoveDocument } from "../hooks/use-documents";
import {
  moveDocumentSchema,
  type MoveDocumentFormValues,
} from "../schemas/document.schema";
import type { Document as DocumentEntity } from "../types/document.types";
import { toDocumentErrorMessage } from "../utils/errors";

export interface MoveDocumentModalProps {
  document: DocumentEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MoveDocumentModal({ document: doc, open, onOpenChange }: MoveDocumentModalProps) {
  const move = useMoveDocument(doc?.id ?? "");

  const form = useAppForm({
    schema: moveDocumentSchema,
    defaultValues: {
      folderId: doc?.folderId ?? null,
      parentId: doc?.parentId ?? null,
    } satisfies MoveDocumentFormValues,
    onSubmit: async (values) => {
      if (!doc) return;
      await move.mutateAsync({
        folderId: values.folderId,
        parentId: values.parentId,
      });
      onOpenChange(false);
    },
  });

  React.useEffect(() => {
    if (!open || !doc) return;
    form.reset({
      folderId: doc.folderId,
      parentId: doc.parentId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doc?.id]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Move document"
      description={doc ? `Choose a new folder for “${doc.title}”.` : undefined}
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || move.error ? (
          <AlertBanner
            tone="error"
            title="Move failed"
            description={toDocumentErrorMessage(form.submitError || move.error)}
          />
        ) : null}
        <FormController
          name="folderId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Folder"
              value={field.value ?? "none"}
              onValueChange={(value) => {
                field.onChange(value === "none" ? null : value);
              }}
              options={[{ value: "none", label: "No folder" }, ...FOLDER_OPTIONS]}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || move.isPending} loadingText="Moving…">
          Move document
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { MoveDocumentModal };
