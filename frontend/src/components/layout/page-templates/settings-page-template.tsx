"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { SettingsPageTemplateProps } from "./types";

/**
 * Settings shell — vertical nav + content panel.
 */
function SettingsPageTemplate({
  title = "Settings",
  description,
  navItems,
  activeId,
  onNavigate,
  children,
  className,
}: SettingsPageTemplateProps) {
  return (
    <PageContainer className={cn("flex flex-col gap-6", className)} data-slot="settings-page-template">
      <PageHeader title={title} description={description} />
      <div className="grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Settings" className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {navItems.map((item) => {
            const active = item.id === activeId;
            const classNameItem = cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              item.disabled && "pointer-events-none opacity-50"
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={classNameItem}
                  onClick={() => onNavigate?.(item.id)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                aria-current={active ? "page" : undefined}
                className={classNameItem}
                onClick={() => onNavigate?.(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </PageContainer>
  );
}

export { SettingsPageTemplate };
