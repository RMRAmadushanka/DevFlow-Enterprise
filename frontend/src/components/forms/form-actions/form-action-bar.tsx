import * as React from "react";

import { FormActions, type FormActionsAlign } from "@/components/forms/form-layout";
import { SubmitButton } from "./submit-button";
import { CancelButton } from "./cancel-button";
import { ResetButton } from "./reset-button";

export interface FormActionBarProps {
  submitLabel?: React.ReactNode;
  submitLoadingLabel?: React.ReactNode;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  onCancel?: () => void;
  cancelLabel?: React.ReactNode;
  onReset?: () => void;
  resetLabel?: React.ReactNode;
  resetConfirmMessage?: string;
  align?: FormActionsAlign;
  className?: string;
}

/**
 * The common Submit / Cancel / Reset row, pre-wired to loading/disabled
 * state. Compose the individual buttons directly for anything more
 * bespoke (extra actions, a "Save as draft" secondary button, etc).
 */
function FormActionBar({
  submitLabel = "Save",
  submitLoadingLabel = "Saving…",
  isSubmitting = false,
  submitDisabled,
  onCancel,
  cancelLabel = "Cancel",
  onReset,
  resetLabel = "Reset",
  resetConfirmMessage,
  align = "end",
  className,
}: FormActionBarProps) {
  return (
    <FormActions align={align} className={className}>
      {onReset ? (
        <ResetButton onReset={onReset} confirmMessage={resetConfirmMessage}>
          {resetLabel}
        </ResetButton>
      ) : null}
      {onCancel ? (
        <CancelButton onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </CancelButton>
      ) : null}
      <SubmitButton loading={isSubmitting} loadingText={submitLoadingLabel} disabled={submitDisabled}>
        {submitLabel}
      </SubmitButton>
    </FormActions>
  );
}

export { FormActionBar };
