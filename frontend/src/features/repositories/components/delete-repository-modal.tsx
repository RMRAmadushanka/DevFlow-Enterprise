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

import { useDeleteRepository } from "../hooks/use-repositories";
import {
  deleteRepositorySchema,
  type DeleteRepositoryFormValues,
} from "../schemas/repository.schema";
import type { Repository as RepositoryEntity } from "../types/repository.types";
import { toRepositoryErrorMessage } from "../utils/errors";

export interface DeleteRepositoryModalProps {
  repository: RepositoryEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteRepositoryModal({
  repository,
  open,
  onOpenChange,
}: DeleteRepositoryModalProps) {
  const remove = useDeleteRepository();

  const form = useAppForm({
    schema: deleteRepositorySchema,
    defaultValues: {
      confirmation: "",
    } satisfies DeleteRepositoryFormValues,
    onSubmit: async (values) => {
      if (!repository) return;
      if (values.confirmation !== "DELETE") {
        form.setError("confirmation", { message: 'Type "DELETE" to confirm' });
        return;
      }
      await remove.mutateAsync(repository.id);
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete repository?"
      description={
        repository
          ? `Type DELETE to permanently remove ${repository.name}. This action cannot be undone.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || remove.error ? (
          <AlertBanner
            tone="error"
            title="Delete failed"
            description={toRepositoryErrorMessage(form.submitError || remove.error)}
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
          Delete repository
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { DeleteRepositoryModal };
