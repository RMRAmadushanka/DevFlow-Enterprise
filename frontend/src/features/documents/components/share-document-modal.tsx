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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/feedback/toast";
import { routes } from "@/config/routes";

import { VISIBILITY_OPTIONS } from "../constants/document.constants";
import { useShareDocument } from "../hooks/use-documents";
import {
  shareDocumentSchema,
  type ShareDocumentFormValues,
} from "../schemas/document.schema";
import type { Document as DocumentEntity, DocumentVisibility } from "../types/document.types";
import { toDocumentErrorMessage } from "../utils/errors";

export interface ShareDocumentModalProps {
  document: DocumentEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ShareDocumentModal({ document: doc, open, onOpenChange }: ShareDocumentModalProps) {
  const share = useShareDocument(doc?.id ?? "");

  const form = useAppForm({
    schema: shareDocumentSchema,
    defaultValues: {
      visibility: (doc?.visibility ?? "workspace") as DocumentVisibility,
      userIds: [],
      permission: "view" as const,
      publicLinkEnabled: false,
    } satisfies ShareDocumentFormValues,
    onSubmit: async (values) => {
      if (!doc) return;
      await share.mutateAsync({
        visibility: values.visibility,
        userIds: values.userIds,
        permission: values.permission,
        publicLinkEnabled: values.publicLinkEnabled,
      });
      onOpenChange(false);
    },
  });

  React.useEffect(() => {
    if (!open || !doc) return;
    form.reset({
      visibility: doc.visibility,
      userIds: [],
      permission: "view",
      publicLinkEnabled: doc.visibility === "public",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when modal opens for a document
  }, [open, doc?.id]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Share document"
      description={doc ? `Control who can access “${doc.title}”.` : undefined}
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || share.error ? (
          <AlertBanner
            tone="error"
            title="Share failed"
            description={toDocumentErrorMessage(form.submitError || share.error)}
          />
        ) : null}
        <FormController
          name="visibility"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Visibility"
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value as DocumentVisibility);
              }}
              options={VISIBILITY_OPTIONS.filter((o) => o.value !== "all")}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="permission"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Permission for invitees"
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value);
              }}
              options={[
                { value: "view", label: "Can view" },
                { value: "comment", label: "Can comment" },
                { value: "edit", label: "Can edit" },
              ]}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!doc) return;
              const url = `${window.location.origin}${routes.app.document(doc.id)}`;
              await navigator.clipboard.writeText(url);
              toast.success("Link copied");
            }}
          >
            Copy link
          </Button>
          <SubmitButton loading={form.isSubmitting || share.isPending} loadingText="Sharing…">
            Save sharing
          </SubmitButton>
        </div>
      </AppForm>
    </Modal>
  );
}

export { ShareDocumentModal };
