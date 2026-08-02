import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Typography primitive — renders the semantic type scale defined in
 * globals.css (`text-display`, `text-heading`, …). Prefer this over
 * ad-hoc `text-[Npx]` classes so every page shares one type hierarchy.
 */
const textVariants = cva("text-text-primary", {
  variants: {
    variant: {
      display: "text-display",
      heading: "text-heading",
      title: "text-title",
      subtitle: "text-subtitle",
      body: "text-body",
      bodyStrong: "text-body-strong",
      caption: "text-caption text-text-secondary",
      small: "text-small text-text-secondary",
      label: "text-label text-text-secondary",
      code: "text-code font-mono",
    },
    tone: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      muted: "text-text-muted",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      info: "text-info",
      link: "text-link",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

const defaultElement: Record<string, keyof React.JSX.IntrinsicElements> = {
  display: "h1",
  heading: "h1",
  title: "h2",
  subtitle: "h3",
  body: "p",
  bodyStrong: "p",
  caption: "p",
  small: "span",
  label: "span",
  code: "code",
};

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: keyof React.JSX.IntrinsicElements;
}

function Text({ className, variant, tone, as, ...props }: TextProps) {
  const Component = (as ?? defaultElement[variant ?? "body"] ?? "p") as React.ElementType;
  return (
    <Component
      data-slot="text"
      className={cn(textVariants({ variant, tone }), className)}
      {...props}
    />
  );
}

export { Text, textVariants };
