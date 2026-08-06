import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatChange } from "@/components/data-display/shared/formatters";
import type { TrendDirection } from "@/components/dashboard/shared/types";
import type { MetricCardProps } from "./types";

const trendIcon: Record<TrendDirection, React.ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const trendClassName: Record<TrendDirection, string> = {
  up: "text-success",
  down: "text-danger",
  flat: "text-muted-foreground",
};

const variantClassName: Record<NonNullable<MetricCardProps["variant"]>, string> = {
  default: "",
  success: "ring-success/30",
  warning: "ring-warning/30",
  danger: "ring-danger/30",
};

const variantIconClassName: Record<NonNullable<MetricCardProps["variant"]>, string> = {
  default: "bg-primary-muted text-primary",
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
};

function inferTrend(change: number): TrendDirection {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

/**
 * KPI metric card — title, value, trend delta, optional icon.
 * Purely presentational; callers supply formatted values.
 */
function MetricCard({
  title,
  value,
  change,
  changeLabel = "Compared to last month",
  trend,
  icon,
  description,
  variant = "default",
  loading,
  className,
}: MetricCardProps) {
  const resolvedTrend = trend ?? (change !== undefined ? inferTrend(change) : undefined);
  const TrendIcon = resolvedTrend ? trendIcon[resolvedTrend] : null;

  return (
    <Card
      data-slot="metric-card"
      data-variant={variant}
      className={cn(variant !== "default" && "ring-2", variantClassName[variant], className)}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon ? (
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4",
                variantIconClassName[variant]
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>

        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl leading-none font-semibold text-foreground tabular-nums">{value}</p>
        )}

        {loading ? (
          <Skeleton className="h-4 w-36" />
        ) : description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : change !== undefined ? (
          <div className="flex flex-col gap-0.5">
            <p
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                resolvedTrend && trendClassName[resolvedTrend]
              )}
            >
              {TrendIcon ? <TrendIcon className="size-3.5" aria-hidden="true" /> : null}
              <span>{formatChange(change)}</span>
            </p>
            {changeLabel ? <p className="text-xs text-muted-foreground">{changeLabel}</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { MetricCard };
