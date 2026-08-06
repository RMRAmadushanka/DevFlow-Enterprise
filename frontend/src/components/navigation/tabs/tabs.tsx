"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppTabsProps } from "./types";

/**
 * Product tabs with default / underline / pills variants, optional icons
 * and badges. Wraps the ui Tabs primitives.
 */
function AppTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "default",
  className,
  listClassName,
}: AppTabsProps) {
  const listVariant = variant === "underline" ? "line" : "default";

  return (
    <Tabs
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList
        variant={listVariant}
        className={cn(
          variant === "pills" && "gap-1 bg-transparent p-0",
          listClassName
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              variant === "pills" &&
                "rounded-full border border-transparent bg-muted/60 px-3 data-active:border-border data-active:bg-background data-active:shadow-sm"
            )}
          >
            {item.icon}
            {item.label}
            {item.badge ? (
              <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
                {item.badge}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) =>
        item.content != null ? (
          <TabsContent key={item.value} value={item.value}>
            {item.content}
          </TabsContent>
        ) : null
      )}
    </Tabs>
  );
}

export { AppTabs };
