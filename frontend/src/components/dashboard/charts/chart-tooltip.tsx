"use client";

import * as React from "react";
import { Tooltip as RechartsTooltip } from "recharts";

import { chartTooltipContentStyle, chartTooltipLabelStyle } from "@/components/dashboard/shared/chart-theme";

type TooltipComponent = typeof RechartsTooltip;

/**
 * Shared Recharts tooltip chrome aligned with DevFlow elevated surfaces.
 */
function ChartTooltip(props: React.ComponentProps<TooltipComponent>) {
  return (
    <RechartsTooltip
      cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
      contentStyle={chartTooltipContentStyle}
      labelStyle={chartTooltipLabelStyle}
      itemStyle={{ color: "var(--foreground)" }}
      {...props}
    />
  );
}

export { ChartTooltip };
