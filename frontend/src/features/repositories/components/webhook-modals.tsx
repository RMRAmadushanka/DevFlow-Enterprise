"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { CheckboxGroupField } from "@/components/forms/checkbox";
import { SwitchField } from "@/components/forms/switch";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { WEBHOOK_EVENT_OPTIONS } from "../constants/repository.constants";
import {
  useCreateWebhook,
  useUpdateWebhook,
} from "../hooks/use-repositories";
import {
  createWebhookSchema,
  updateWebhookSchema,
  type CreateWebhookFormValues,
  type UpdateWebhookFormValues,
} from "../schemas/repository.schema";
import type { RepositoryWebhook } from "../types/repository.types";
import { toRepositoryErrorMessage } from "../utils/errors";

export interface CreateWebhookModalProps {
  repositoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateWebhookModal({
  repositoryId,
  open,
  onOpenChange,
}: CreateWebhookModalProps) {
  const create = useCreateWebhook(repositoryId);

  const form = useAppForm({
    schema: createWebhookSchema,
    defaultValues: {
      url: "",
      events: ["push"],
      secretConfigured: true,
    } satisfies CreateWebhookFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        url: values.url,
        events: values.events,
        secretConfigured: values.secretConfigured,
      });
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create webhook"
      description="Deliver repository events to an external endpoint."
      size="lg"
    >
      <AppForm form={form} className="gap-4">
        {form.submitError || create.error ? (
          <AlertBanner
            tone="error"
            title="Could not create webhook"
            description={toRepositoryErrorMessage(form.submitError || create.error)}
          />
        ) : null}
        <FormController
          name="url"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Payload URL"
              placeholder="https://example.com/hooks"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="events"
          control={form.control}
          render={({ field, fieldState }) => (
            <CheckboxGroupField
              label="Events"
              options={WEBHOOK_EVENT_OPTIONS}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="secretConfigured"
          control={form.control}
          render={({ field }) => (
            <SwitchField
              label="Configure secret"
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || create.isPending}
          loadingText="Creating…"
        >
          Create webhook
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export interface EditWebhookModalProps {
  repositoryId: string;
  webhook: RepositoryWebhook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditWebhookModalInner({
  repositoryId,
  webhook,
  open,
  onOpenChange,
}: {
  repositoryId: string;
  webhook: RepositoryWebhook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateWebhook(repositoryId);

  const form = useAppForm({
    schema: updateWebhookSchema,
    defaultValues: {
      url: webhook.url,
      events: webhook.events,
      secretConfigured: webhook.secretConfigured,
      status: webhook.status,
    } satisfies UpdateWebhookFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        webhookId: webhook.id,
        payload: {
          url: values.url,
          events: values.events,
          secretConfigured: values.secretConfigured,
          status: values.status,
        },
      });
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit webhook"
      description="Update delivery URL and subscribed events."
      size="lg"
    >
      <AppForm form={form} className="gap-4">
        {form.submitError || update.error ? (
          <AlertBanner
            tone="error"
            title="Could not update webhook"
            description={toRepositoryErrorMessage(form.submitError || update.error)}
          />
        ) : null}
        <FormController
          name="url"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              value={field.value ?? ""}
              label="Payload URL"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="events"
          control={form.control}
          render={({ field, fieldState }) => (
            <CheckboxGroupField
              label="Events"
              options={WEBHOOK_EVENT_OPTIONS}
              value={field.value ?? []}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="secretConfigured"
          control={form.control}
          render={({ field }) => (
            <SwitchField
              label="Configure secret"
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || update.isPending}
          loadingText="Saving…"
        >
          Save changes
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

function EditWebhookModal({
  repositoryId,
  webhook,
  open,
  onOpenChange,
}: EditWebhookModalProps) {
  if (!webhook) return null;
  return (
    <EditWebhookModalInner
      key={webhook.id}
      repositoryId={repositoryId}
      webhook={webhook}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

export { CreateWebhookModal, EditWebhookModal };
