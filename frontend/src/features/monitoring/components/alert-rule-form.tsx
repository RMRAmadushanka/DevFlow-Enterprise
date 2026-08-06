"use client";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SelectField } from "@/components/forms/select";
import { NumberInput } from "@/components/forms/number-input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import {
  CHANNEL_OPTIONS,
  CONDITION_OPTIONS,
  METRIC_OPTIONS,
  SERVICE_OPTIONS,
  SEVERITY_OPTIONS,
} from "../constants/monitoring.constants";
import { useCreateAlert, useUpdateAlert } from "../hooks/use-monitoring";
import {
  createAlertSchema,
  updateAlertSchema,
  type CreateAlertFormValues,
  type UpdateAlertFormValues,
} from "../schemas/alert.schema";
import type { Alert } from "../types/monitoring.types";
import { toMonitoringErrorMessage } from "../utils/errors";

const severityOptions = SEVERITY_OPTIONS.filter((o) => o.value !== "all");
const serviceOptions = SERVICE_OPTIONS.filter((o) => o.value !== "all");

export interface AlertRuleFormProps {
  mode: "create" | "edit";
  alert?: Alert;
  onSuccess?: () => void;
  compact?: boolean;
}

function CreateAlertForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const create = useCreateAlert();

  const form = useAppForm({
    schema: createAlertSchema,
    defaultValues: {
      name: "",
      description: "",
      severity: "medium",
      service: "projects",
      metric: "error_rate",
      threshold: 1,
      condition: "gte",
      notificationChannel: "email",
    } satisfies CreateAlertFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        severity: values.severity,
        service: values.service,
        metric: values.metric,
        threshold: values.threshold,
        condition: values.condition,
        notificationChannel: values.notificationChannel || undefined,
      });
      onSuccess?.();
    },
  });

  return (
    <AlertRuleFields
      form={form}
      error={form.submitError || create.error}
      loading={form.isSubmitting || create.isPending}
      submitLabel="Create alert"
    />
  );
}

function EditAlertForm({
  alert,
  onSuccess,
}: {
  alert: Alert;
  onSuccess?: () => void;
}) {
  const update = useUpdateAlert(alert.id);

  const form = useAppForm({
    schema: updateAlertSchema,
    defaultValues: {
      name: alert.name,
      description: alert.description,
      severity: alert.severity,
      service: alert.service,
      metric: alert.metric,
      threshold: alert.threshold,
      condition: alert.condition,
      notificationChannel: alert.notificationChannel,
      status: alert.status,
    } satisfies UpdateAlertFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        severity: values.severity,
        service: values.service,
        metric: values.metric,
        threshold: values.threshold,
        condition: values.condition,
        notificationChannel: values.notificationChannel || undefined,
        status: values.status,
      });
      onSuccess?.();
    },
  });

  return (
    <AlertRuleFields
      form={form}
      error={form.submitError || update.error}
      loading={form.isSubmitting || update.isPending}
      submitLabel="Save changes"
      showStatus
    />
  );
}

function AlertRuleFields({
  form,
  error,
  loading,
  submitLabel,
  showStatus,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  error: unknown;
  loading: boolean;
  submitLabel: string;
  showStatus?: boolean;
}) {
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "triggered", label: "Triggered" },
    { value: "acknowledged", label: "Acknowledged" },
    { value: "resolved", label: "Resolved" },
    { value: "disabled", label: "Disabled" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <AlertBanner
          tone="error"
          title="Could not save alert"
          description={toMonitoringErrorMessage(error)}
        />
      ) : null}
      <AppForm form={form} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Name" required error={fieldState.error?.message} />
          )}
        />
        <FormController
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextareaField
              {...field}
              label="Description"
              error={fieldState.error?.message}
              rows={3}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="severity"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Severity"
                value={field.value}
                onValueChange={field.onChange}
                options={severityOptions}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="service"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Service"
                value={field.value}
                onValueChange={field.onChange}
                options={serviceOptions}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="metric"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Metric"
                value={field.value}
                onValueChange={field.onChange}
                options={METRIC_OPTIONS}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="condition"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Condition"
                value={field.value}
                onValueChange={field.onChange}
                options={CONDITION_OPTIONS}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="threshold"
            control={form.control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Threshold"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
              />
            )}
          />
          <FormController
            name="notificationChannel"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Notification channel"
                value={field.value || "email"}
                onValueChange={field.onChange}
                options={CHANNEL_OPTIONS}
                error={fieldState.error?.message}
              />
            )}
          />
          {showStatus ? (
            <FormController
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="Status"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={statusOptions}
                  error={fieldState.error?.message}
                />
              )}
            />
          ) : null}
        </div>
        <SubmitButton loading={loading} loadingText="Saving…">
          {submitLabel}
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function AlertRuleForm({ mode, alert, onSuccess }: AlertRuleFormProps) {
  if (mode === "edit" && alert) {
    return <EditAlertForm alert={alert} onSuccess={onSuccess} />;
  }
  return <CreateAlertForm onSuccess={onSuccess} />;
}

export { AlertRuleForm };
