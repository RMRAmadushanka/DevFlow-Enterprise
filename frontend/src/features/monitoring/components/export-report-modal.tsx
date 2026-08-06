"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { SelectField } from "@/components/forms/select";
import { CheckboxField } from "@/components/forms/checkbox";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useExportReport } from "../hooks/use-monitoring";
import {
  exportReportSchema,
  type ExportReportFormValues,
} from "../schemas/report.schema";
import type { ReportDefinition } from "../types/monitoring.types";
import { toMonitoringErrorMessage } from "../utils/errors";

const FORMAT_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
];

export interface ExportReportModalProps {
  report: ReportDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ExportReportModal({ report, open, onOpenChange }: ExportReportModalProps) {
  const exportReport = useExportReport();

  const form = useAppForm({
    schema: exportReportSchema,
    defaultValues: {
      format: "pdf",
      share: false,
    } satisfies ExportReportFormValues,
    onSubmit: async (values) => {
      if (!report) return;
      await exportReport.mutateAsync({ id: report.id, format: values.format });
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Export report"
      description={
        report
          ? `Download “${report.name}” as PDF or CSV.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-4">
        {form.submitError || exportReport.error ? (
          <AlertBanner
            tone="error"
            title="Export failed"
            description={toMonitoringErrorMessage(form.submitError || exportReport.error)}
          />
        ) : null}
        <FormController
          name="format"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Format"
              value={field.value}
              onValueChange={field.onChange}
              options={FORMAT_OPTIONS}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="share"
          control={form.control}
          render={({ field }) => (
            <CheckboxField
              label="Share link with workspace admins"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || exportReport.isPending}
          loadingText="Exporting…"
        >
          Start export
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { ExportReportModal };
