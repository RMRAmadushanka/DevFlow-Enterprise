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

import { useTransferProjectOwnership } from "../hooks/use-projects";
import {
  transferProjectOwnershipSchema,
  type TransferProjectOwnershipFormValues,
} from "../schemas/project.schema";
import type { Project, ProjectMember } from "../types/project.types";
import { toProjectErrorMessage } from "../utils/errors";

export interface TransferOwnershipModalProps {
  project: Project | null;
  members: ProjectMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TransferOwnershipModal({
  project,
  members,
  open,
  onOpenChange,
}: TransferOwnershipModalProps) {
  const transfer = useTransferProjectOwnership(project?.id ?? "");

  const form = useAppForm({
    schema: transferProjectOwnershipSchema,
    defaultValues: {
      memberId: "",
      confirmation: "",
    } satisfies TransferProjectOwnershipFormValues,
    onSubmit: async (values) => {
      if (!project) return;
      if (values.confirmation !== "TRANSFER") {
        form.setError("confirmation", { message: "Type TRANSFER to confirm" });
        return;
      }
      await transfer.mutateAsync(values);
      form.reset();
      onOpenChange(false);
    },
  });

  const candidates = members.filter(
    (member) => member.userId !== project?.ownerId
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Transfer ownership"
      description="Assign project ownership to another member. Type TRANSFER to confirm."
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || transfer.error ? (
          <AlertBanner
            tone="error"
            title="Transfer failed"
            description={toProjectErrorMessage(form.submitError || transfer.error)}
          />
        ) : null}
        <FormController
          name="memberId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="New owner"
              options={candidates.map((member) => ({
                value: member.id,
                label: `${member.name} (${member.email})`,
              }))}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="confirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Confirmation"
              placeholder="TRANSFER"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || transfer.isPending}
          loadingText="Transferring…"
          variant="outline"
        >
          Transfer ownership
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { TransferOwnershipModal };
