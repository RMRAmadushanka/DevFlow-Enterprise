"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { appConfig } from "@/config/app";
import { duration, easing } from "@/design-system/tokens/motion";

export interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Split brand + card layout on desktop; single column on mobile.
 */
function AuthLayout({ title, description, children, footer, className }: AuthLayoutProps) {
  return (
    <div
      data-slot="auth-layout"
      className={cn(
        "grid min-h-dvh w-full bg-background lg:grid-cols-2",
        className
      )}
    >
      <aside className="relative hidden overflow-hidden bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_45%),radial-gradient(circle_at_80%_70%,color-mix(in_oklch,var(--info)_16%,transparent),transparent_40%)]" />
        <Link href={routes.home} className="relative z-10 text-lg font-semibold text-foreground">
          {appConfig.name}
        </Link>
        <div className="relative z-10 max-w-md space-y-3">
          <Text variant="heading" as="h1" className="text-3xl tracking-tight">
            Ship with confidence
          </Text>
          <Text tone="secondary">
            Projects, deployments, and engineering operations in one secure workspace.
          </Text>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {appConfig.shortName}
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.moderate, ease: easing.decelerate }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Link href={routes.home} className="text-base font-semibold text-foreground">
              {appConfig.name}
            </Link>
          </div>

          <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
            <div className="mb-6 flex flex-col gap-1">
              <Text variant="title" as="h1">
                {title}
              </Text>
              {description ? <Text tone="secondary">{description}</Text> : null}
            </div>
            {children}
          </div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}
        </motion.div>
      </main>
    </div>
  );
}

export { AuthLayout };
