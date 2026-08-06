"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SelectField } from "@/components/forms/select";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import {
  DOCUMENT_ICONS,
  FOLDER_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants/document.constants";
import {
  useCreateDocument,
  useDocumentTemplates,
  useUpdateDocument,
} from "../hooks/use-documents";
import {
  createDocumentSchema,
  updateDocumentSchema,
  type CreateDocumentFormValues,
  type UpdateDocumentFormValues,
} from "../schemas/document.schema";
import type { Document as DocumentEntity, DocumentVisibility } from "../types/document.types";
import { toDocumentErrorMessage } from "../utils/errors";

export interface DocumentFormProps {
  mode: "create" | "edit";
  document?: DocumentEntity;
  defaultFolderId?: string | null;
  defaultTemplateId?: string | null;
  compact?: boolean;
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function CreateDocumentFormInner({
  defaultFolderId,
  defaultTemplateId,
  compact,
}: {
  defaultFolderId?: string | null;
  defaultTemplateId?: string | null;
  compact?: boolean;
}) {
  const create = useCreateDocument();
  const { data: templates = [] } = useDocumentTemplates("all");

  const form = useAppForm({
    schema: createDocumentSchema,
    defaultValues: {
      title: "",
      description: "",
      folderId: defaultFolderId ?? null,
      parentId: null,
      tags: [],
      visibility: "workspace",
      templateId: defaultTemplateId ?? null,
      icon: "📄",
      coverImageUrl: "",
    } satisfies CreateDocumentFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        folderId: values.folderId,
        parentId: values.parentId,
        tags: values.tags,
        visibility: values.visibility,
        templateId: values.templateId,
        icon: values.icon || undefined,
        coverImageUrl: values.coverImageUrl || undefined,
      });
    },
  });

  const [tagsText, setTagsText] = React.useState("");

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || create.error ? (
        <AlertBanner
          tone="error"
          title="Could not create document"
          description={toDocumentErrorMessage(form.submitError || create.error)}
        />
      ) : null}
      <AppForm form={form} className="gap-4">
        <FormController
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Title" required error={fieldState.error?.message} />
          )}
        />
        {!compact ? (
          <FormController
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextareaField
                {...field}
                label="Description"
                rows={3}
                error={fieldState.error?.message}
              />
            )}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <FormController
          name="templateId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Template"
              value={field.value ?? "none"}
              onValueChange={(value) => {
                field.onChange(value === "none" ? null : value);
              }}
              options={[
                { value: "none", label: "Blank document" },
                ...templates.map((t) => ({ value: t.id, label: t.name })),
              ]}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="icon"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Icon"
                value={field.value || "📄"}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
                options={DOCUMENT_ICONS.map((icon) => ({ value: icon, label: icon }))}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="coverImageUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value ?? ""}
                label="Cover image URL"
                placeholder="https://"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <TextInput
          label="Tags"
          value={tagsText}
          onChange={(next) => {
            setTagsText(next);
            form.setValue("tags", parseTags(next));
          }}
          placeholder="Comma-separated tags"
          helperText="Separate tags with commas"
        />
        <FormController
          name="parentId"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Parent document ID"
              value={field.value ?? ""}
              onChange={(value) => {
                field.onChange(value || null);
              }}
              onBlur={field.onBlur}
              name={field.name}
              placeholder="Optional parent document"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || create.isPending} loadingText="Creating…">
          Create document
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function EditDocumentFormInner({
  document: doc,
  compact,
}: {
  document: DocumentEntity;
  compact?: boolean;
}) {
  const update = useUpdateDocument(doc.id);
  const { data: templates = [] } = useDocumentTemplates("all");
  const [tagsText, setTagsText] = React.useState(doc.tags.join(", "));

  const form = useAppForm({
    schema: updateDocumentSchema,
    defaultValues: {
      title: doc.title,
      description: doc.description,
      folderId: doc.folderId,
      parentId: doc.parentId,
      tags: doc.tags,
      visibility: doc.visibility,
      templateId: doc.templateId ?? null,
      icon: doc.icon,
      coverImageUrl: doc.coverImageUrl ?? "",
    } satisfies UpdateDocumentFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        title: values.title,
        description: values.description,
        folderId: values.folderId,
        parentId: values.parentId,
        tags: values.tags,
        visibility: values.visibility,
        icon: values.icon,
        coverImageUrl: values.coverImageUrl || undefined,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || update.error ? (
        <AlertBanner
          tone="error"
          title="Could not update document"
          description={toDocumentErrorMessage(form.submitError || update.error)}
        />
      ) : null}
      <AppForm form={form} className="gap-4">
        <FormController
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Title" required error={fieldState.error?.message} />
          )}
        />
        {!compact ? (
          <FormController
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextareaField
                {...field}
                label="Description"
                rows={3}
                error={fieldState.error?.message}
              />
            )}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        {!compact ? (
          <FormController
            name="templateId"
            control={form.control}
            render={({ field }) => (
              <SelectField
                label="Template"
                value={field.value ?? "none"}
                onValueChange={(value) => {
                  field.onChange(value === "none" ? null : value);
                }}
                options={[
                  { value: "none", label: "Blank document" },
                  ...templates.map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
            )}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="icon"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Icon"
                value={field.value || "📄"}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
                options={DOCUMENT_ICONS.map((icon) => ({ value: icon, label: icon }))}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="coverImageUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value ?? ""}
                label="Cover image URL"
                placeholder="https://"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <TextInput
          label="Tags"
          value={tagsText}
          onChange={(next) => {
            setTagsText(next);
            form.setValue("tags", parseTags(next));
          }}
          placeholder="Comma-separated tags"
        />
        <FormController
          name="parentId"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Parent document ID"
              value={field.value ?? ""}
              onChange={(value) => {
                field.onChange(value || null);
              }}
              onBlur={field.onBlur}
              name={field.name}
              placeholder="Optional parent document"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
          Save changes
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function DocumentForm({
  mode,
  document: doc,
  defaultFolderId,
  defaultTemplateId,
  compact,
}: DocumentFormProps) {
  if (mode === "edit") {
    if (!doc) return null;
    return <EditDocumentFormInner document={doc} compact={compact} />;
  }
  return (
    <CreateDocumentFormInner
      defaultFolderId={defaultFolderId}
      defaultTemplateId={defaultTemplateId}
      compact={compact}
    />
  );
}

export { DocumentForm };
