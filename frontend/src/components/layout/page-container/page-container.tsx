import * as React from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Set false to opt out of the default vertical page padding (e.g. for full-bleed page content). */
  padded?: boolean;
}

/**
 * Wraps every page's content area: caps width at 1440px on desktop
 * (delegating to the design system's `<Container size="default">`),
 * applies 16px horizontal padding on mobile, and adds standard vertical
 * page rhythm. This is the outermost element every page body should use,
 * directly below `PageHeader`.
 */
export function PageContainer({ padded = true, className, children, ...props }: PageContainerProps) {
  return (
    <Container size="default" gutter="default" className={cn(padded && "py-6 sm:py-8", className)} {...props}>
      {children}
    </Container>
  );
}
