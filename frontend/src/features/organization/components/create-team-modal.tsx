"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useCreateTeam } from "../hooks/use-members";
import { createTeamSchema, type CreateTeamFormValues } from "../schemas/member.schema";
import { toOrganizationErrorMessage } from "../utils/errors";

export interface CreateTeamModalProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateTeamModal({ organizationId, open, onOpenChange }: CreateTeamModalProps) {
  const create = useCreateTeam(organizationId);

  const form = useAppForm({
    schema: createTeamSchema,
    defaultValues: {
      name: "",
      description: "",
      memberIds: [],
    } satisfies CreateTeamFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        name: values.name,
        description: values.description ?? "",
        memberIds: values.memberIds,
      });
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create team"
      description="Group members for ownership and notifications."
    >
      <div className="flex flex-col gap-4">
        {form.submitError || create.error ? (
          <AlertBanner
            tone="error"
            title="Could not create team"
            description={toOrganizationErrorMessage(form.submitError || create.error)}
          />
        ) : null}
        <AppForm form={form} className="gap-4">
          <FormController
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput {...field} label="Team name" required error={fieldState.error?.message} />
            )}
          />
          <FormController
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextareaField {...field} label="Description" rows={3} error={fieldState.error?.message} />
            )}
          />
          <SubmitButton loading={form.isSubmitting || create.isPending} loadingText="Creating…">
            Create team
          </SubmitButton>
        </AppForm>
      </div>
    </Modal>
  );
}

export { CreateTeamModal };
