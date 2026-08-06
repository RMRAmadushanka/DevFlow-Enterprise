"use client";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SelectField } from "@/components/forms/select";
import { CheckboxGroupField } from "@/components/forms/checkbox";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { REPORT_METRIC_OPTIONS } from "../constants/monitoring.constants";
import { useCreateReport } from "../hooks/use-monitoring";
import {
  createReportSchema,
  type CreateReportFormValues,
} from "../schemas/report.schema";
import { toMonitoringErrorMessage } from "../utils/errors";

const CATEGORY_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "executive", label: "Executive" },
  { value: "operations", label: "Operations" },
  { value: "security", label: "Security" },
];

export interface ReportBuilderProps {
  onSuccess?: () => void;
}

function ReportBuilder({ onSuccess }: ReportBuilderProps) {
  const create = useCreateReport();

  const form = useAppForm({
    schema: createReportSchema,
    defaultValues: {
      name: "",
      description: "",
      category: "engineering",
      metrics: ["velocity"],
      schedule: "",
    } satisfies CreateReportFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        category: values.category,
        metrics: values.metrics,
        schedule: values.schedule || undefined,
      });
      onSuccess?.();
    },
  });

  return (
    <div className="flex flex-col gap-4" data-slot="report-builder">
      {form.submitError || create.error ? (
        <AlertBanner
          tone="error"
          title="Could not create report"
          description={toMonitoringErrorMessage(form.submitError || create.error)}
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
        <FormController
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Category"
              value={field.value}
              onValueChange={field.onChange}
              options={CATEGORY_OPTIONS}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="metrics"
          control={form.control}
          render={({ field, fieldState }) => (
            <CheckboxGroupField
              label="Metrics"
              value={field.value}
              onValueChange={field.onChange}
              options={REPORT_METRIC_OPTIONS}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="schedule"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Schedule (optional)"
              placeholder="e.g. Weekly on Monday"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || create.isPending}
          loadingText="Creating…"
        >
          Create report
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { ReportBuilder };
