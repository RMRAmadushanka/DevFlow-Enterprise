"use client";

import * as React from "react";

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
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import {
  useDeleteOrganization,
  useTransferOwnership,
} from "../hooks/use-organizations";
import { useMembers } from "../hooks/use-members";
import {
  deleteOrganizationSchema,
  transferOwnershipSchema,
  type DeleteOrganizationFormValues,
  type TransferOwnershipFormValues,
} from "../schemas/organization.schema";
import type { Organization } from "../types/organization.types";
import { toOrganizationErrorMessage } from "../utils/errors";

export interface DangerZoneProps {
  organization: Organization;
}

function DangerZone({ organization }: DangerZoneProps) {
  const { data: members = [] } = useMembers(organization.id);
  const transfer = useTransferOwnership(organization.id);
  const remove = useDeleteOrganization();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const transferForm = useAppForm({
    schema: transferOwnershipSchema,
    defaultValues: {
      memberId: "",
      confirmation: "",
    } satisfies TransferOwnershipFormValues,
    onSubmit: async (values) => {
      if (values.confirmation !== "TRANSFER") {
        transferForm.setError("confirmation", { message: "Type TRANSFER to confirm" });
        return;
      }
      await transfer.mutateAsync(values);
      transferForm.reset();
    },
  });

  const deleteForm = useAppForm({
    schema: deleteOrganizationSchema,
    defaultValues: {
      confirmation: "",
    } satisfies DeleteOrganizationFormValues,
    onSubmit: async (values) => {
      if (values.confirmation !== organization.slug) {
        deleteForm.setError("confirmation", {
          message: "Confirmation slug does not match",
        });
        return;
      }
      await remove.mutateAsync({
        id: organization.id,
        confirmation: values.confirmation,
      });
    },
  });

  const transferCandidates = members.filter(
    (member) => member.role !== "owner" && member.status === "active"
  );

  return (
    <div className="flex flex-col gap-6" data-slot="danger-zone">
      <PermissionGuard permission="organization.update">
        <section className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Transfer ownership</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Transfer the owner role to another active member. Type TRANSFER to confirm.
          </p>
          {transferForm.submitError || transfer.error ? (
            <div className="mt-3">
              <AlertBanner
                tone="error"
                title="Transfer failed"
                description={toOrganizationErrorMessage(
                  transferForm.submitError || transfer.error
                )}
              />
            </div>
          ) : null}
          <AppForm form={transferForm} className="mt-4 gap-3">
            <FormController
              name="memberId"
              control={transferForm.control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="New owner"
                  options={transferCandidates.map((member) => ({
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
              control={transferForm.control}
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
              loading={transferForm.isSubmitting || transfer.isPending}
              loadingText="Transferring…"
              variant="outline"
            >
              Transfer ownership
            </SubmitButton>
          </AppForm>
        </section>
      </PermissionGuard>

      <PermissionGuard permission="organization.delete">
        <section className="rounded-xl border border-destructive/40 p-4">
          <h3 className="text-sm font-semibold text-destructive">Delete organization</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete {organization.name}. This cannot be undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            className="mt-4"
            onClick={() => setDeleteOpen(true)}
          >
            Delete organization
          </Button>
        </section>
      </PermissionGuard>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete organization?"
        description={`Type the slug “${organization.slug}” to confirm deletion.`}
      >
        <AppForm form={deleteForm} className="gap-3">
          {deleteForm.submitError || remove.error ? (
            <AlertBanner
              tone="error"
              title="Delete failed"
              description={toOrganizationErrorMessage(deleteForm.submitError || remove.error)}
            />
          ) : null}
          <FormController
            name="confirmation"
            control={deleteForm.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Organization slug"
                placeholder={organization.slug}
                error={fieldState.error?.message}
              />
            )}
          />
          <SubmitButton
            loading={deleteForm.isSubmitting || remove.isPending}
            loadingText="Deleting…"
            variant="destructive"
          >
            Delete forever
          </SubmitButton>
        </AppForm>
      </Modal>
    </div>
  );
}

export { DangerZone };
