"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Stepper } from "@/components/navigation/stepper";
import type { WizardPageTemplateProps } from "./types";

/**
 * Multi-step setup / configuration shell — stepper, current step, nav actions.
 */
function WizardPageTemplate({
  title,
  description,
  steps,
  currentStep,
  onStepChange,
  children,
  actions,
  className,
}: WizardPageTemplateProps) {
  return (
    <PageContainer
      className={cn("mx-auto flex w-full max-w-3xl flex-col gap-8", className)}
      data-slot="wizard-page-template"
    >
      <PageHeader title={title} description={description} />
      <Stepper
        steps={steps}
        current={currentStep}
        onStepClick={onStepChange}
        label="Setup progress"
      />
      <div className="min-w-0">{children}</div>
      {actions ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          {actions}
        </div>
      ) : null}
    </PageContainer>
  );
}

export { WizardPageTemplate };
