import * as React from "react";

import { cn } from "@/lib/utils";

interface FormSectionProps extends Omit<React.ComponentProps<"section">, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned slot next to the title (e.g. a "Reset section" link). */
  actions?: React.ReactNode;
}

/** Groups related `FormField`s/`FormRow`s under an optional heading. */
function FormSection({
  className,
  title,
  description,
  actions,
  children,
  ...props
}: FormSectionProps) {
  return (
    <section data-slot="form-section" className={cn("flex flex-col gap-4", className)} {...props}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title ? (
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export { FormSection };
