"use client";

import * as React from "react";

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

import { useMembers, useUpdateTeam } from "../hooks/use-members";
import { updateTeamSchema, type UpdateTeamFormValues } from "../schemas/member.schema";
import type { Team } from "../types/member.types";
import { toOrganizationErrorMessage } from "../utils/errors";
import { TeamMemberList } from "./team-member-list";

export interface EditTeamModalProps {
  organizationId: string;
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditTeamModal({ organizationId, team, open, onOpenChange }: EditTeamModalProps) {
  const update = useUpdateTeam(organizationId);
  const { data: members = [] } = useMembers(organizationId);

  const form = useAppForm({
    schema: updateTeamSchema,
    defaultValues: {
      name: team?.name ?? "",
      description: team?.description ?? "",
      memberIds: team?.memberIds ?? [],
    } satisfies UpdateTeamFormValues,
    onSubmit: async (values) => {
      if (!team) return;
      await update.mutateAsync({
        teamId: team.id,
        payload: {
          name: values.name,
          description: values.description ?? "",
          memberIds: values.memberIds,
        },
      });
      onOpenChange(false);
    },
  });

  React.useEffect(() => {
    if (team && open) {
      form.reset({
        name: team.name,
        description: team.description,
        memberIds: team.memberIds,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, open]);

  const teamMembers = members.filter((member) => team?.memberIds.includes(member.id));

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={team ? `Edit ${team.name}` : "Edit team"}
      description="Update team details and review assigned members."
    >
      <div className="flex flex-col gap-4">
        {form.submitError || update.error ? (
          <AlertBanner
            tone="error"
            title="Could not update team"
            description={toOrganizationErrorMessage(form.submitError || update.error)}
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
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Members</span>
            <TeamMemberList members={teamMembers} />
          </div>
          <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
            Save team
          </SubmitButton>
        </AppForm>
      </div>
    </Modal>
  );
}

export { EditTeamModal };
