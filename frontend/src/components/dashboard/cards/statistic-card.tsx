import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatChange } from "@/components/data-display/shared/formatters";
import type { TrendDirection } from "@/components/dashboard/shared/types";
import type { StatisticCardProps } from "./types";

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

const variantAccent: Record<NonNullable<StatisticCardProps["variant"]>, string> = {
  default: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
};

function inferTrend(change: number): TrendDirection {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

/**
 * Emphasized statistic — large value, percentage change, optional comparison.
 */
function StatisticCard({
  title,
  value,
  change,
  changeLabel,
  trend,
  comparison,
  icon,
  variant = "default",
  loading,
  className,
}: StatisticCardProps) {
  const resolvedTrend = trend ?? (change !== undefined ? inferTrend(change) : undefined);
  const TrendIcon = resolvedTrend ? trendIcon[resolvedTrend] : null;

  return (
    <Card
      data-slot="statistic-card"
      data-variant={variant}
      className={cn("border-l-4", variantAccent[variant], className)}
    >
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon ? <span className="text-muted-foreground [&>svg]:size-4">{icon}</span> : null}
        </div>

        {loading ? (
          <Skeleton className="h-10 w-28" />
        ) : (
          <p className="text-3xl leading-none font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        )}

        {loading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {change !== undefined ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  resolvedTrend && trendClassName[resolvedTrend]
                )}
              >
                {TrendIcon ? <TrendIcon className="size-3.5" aria-hidden="true" /> : null}
                {formatChange(change)}
                {changeLabel ? (
                  <span className="font-normal text-muted-foreground">{changeLabel}</span>
                ) : null}
              </span>
            ) : null}
            {comparison ? <span className="text-muted-foreground">{comparison}</span> : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { StatisticCard };
