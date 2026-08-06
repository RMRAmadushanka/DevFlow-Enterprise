import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatChange } from "@/components/data-display/shared/formatters";
import type { TrendDirection } from "@/components/data-display/shared/types";
import type { StatCardProps } from "./types";

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

function inferTrend(change: number): TrendDirection {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

/**
 * A single-metric summary card — headline number, optional icon, and a
 * change indicator ("+12% this month"). Purely presentational: pages
 * compute `value`/`change` from their own data source.
 */
function StatCard({ title, value, change, changeLabel, trend, icon, description, loading, className }: StatCardProps) {
  const resolvedTrend = trend ?? (change !== undefined ? inferTrend(change) : undefined);
  const TrendIcon = resolvedTrend ? trendIcon[resolvedTrend] : null;

  return (
    <Card className={className}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon ? (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary [&>svg]:size-4">
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
          <Skeleton className="h-4 w-28" />
        ) : description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : change !== undefined ? (
          <p className={cn("flex items-center gap-1 text-sm font-medium", resolvedTrend && trendClassName[resolvedTrend])}>
            {TrendIcon ? <TrendIcon className="size-3.5" /> : null}
            <span>{formatChange(change)}</span>
            {changeLabel ? <span className="font-normal text-muted-foreground">{changeLabel}</span> : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { StatCard };
