"use client";

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
import { ROLE_LABELS, ROLES } from "@/lib/permissions";

import { useInviteMember, useTeams } from "../hooks/use-members";
import {
  inviteMemberSchema,
  type InviteMemberFormValues,
} from "../schemas/member.schema";
import { toOrganizationErrorMessage } from "../utils/errors";

export interface InviteMemberFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

function InviteMemberForm({ organizationId, onSuccess }: InviteMemberFormProps) {
  const invite = useInviteMember(organizationId);
  const { data: teams = [] } = useTeams(organizationId);

  const form = useAppForm({
    schema: inviteMemberSchema,
    defaultValues: {
      email: "",
      role: "developer",
      teamId: "",
      message: "",
    } satisfies InviteMemberFormValues,
    onSubmit: async (values) => {
      await invite.mutateAsync({
        email: values.email,
        role: values.role,
        teamId: values.teamId || undefined,
        message: values.message || undefined,
      });
      form.reset();
      onSuccess?.();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || invite.error ? (
        <AlertBanner
          tone="error"
          title="Invitation failed"
          description={toOrganizationErrorMessage(form.submitError || invite.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              type="email"
              label="Email"
              required
              autoComplete="email"
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Role"
              required
              options={ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="teamId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Team"
              clearable
              placeholder="Optional"
              options={teams.map((team) => ({ value: team.id, label: team.name }))}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextareaField
              {...field}
              label="Message"
              rows={3}
              placeholder="Optional note included in the invite email"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || invite.isPending} loadingText="Sending…">
          Send invitation
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { InviteMemberForm };
