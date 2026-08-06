"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { SelectField } from "@/components/forms/select";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { PROJECT_OPTIONS } from "../constants/repository.constants";
import { useTransferRepository } from "../hooks/use-repositories";
import {
  transferRepositorySchema,
  type TransferRepositoryFormValues,
} from "../schemas/repository.schema";
import type { Repository as RepositoryEntity } from "../types/repository.types";
import { toRepositoryErrorMessage } from "../utils/errors";

export interface TransferRepositoryModalProps {
  repository: RepositoryEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TransferRepositoryModalInner({
  repository,
  open,
  onOpenChange,
}: {
  repository: RepositoryEntity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const transfer = useTransferRepository(repository.id);

  const form = useAppForm({
    schema: transferRepositorySchema,
    defaultValues: {
      organization: "",
      projectId: repository.projectId ?? null,
    } satisfies TransferRepositoryFormValues,
    onSubmit: async (values) => {
      await transfer.mutateAsync({
        organization: values.organization,
        projectId: values.projectId,
      });
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Transfer repository"
      description={`Move ${repository.name} to another organization.`}
      size="md"
    >
      <AppForm form={form} className="gap-4">
        {form.submitError || transfer.error ? (
          <AlertBanner
            tone="error"
            title="Transfer failed"
            description={toRepositoryErrorMessage(form.submitError || transfer.error)}
          />
        ) : null}
        <FormController
          name="organization"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Target organization"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="projectId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Project"
              options={[{ value: "none", label: "No project" }, ...PROJECT_OPTIONS]}
              value={field.value ?? "none"}
              onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || transfer.isPending}
          loadingText="Transferring…"
        >
          Transfer repository
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

function TransferRepositoryModal({
  repository,
  open,
  onOpenChange,
}: TransferRepositoryModalProps) {
  if (!repository) return null;
  return (
    <TransferRepositoryModalInner
      key={repository.id}
      repository={repository}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

export { TransferRepositoryModal };
