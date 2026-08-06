"use client";

import * as React from "react";
import Link from "next/link";

import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useBranches } from "../../hooks/use-repositories";

const BranchSummaryWidget = React.memo(function BranchSummaryWidget({
  repositoryId,
}: {
  repositoryId: string;
}) {
  const { data = [], isLoading, isError, refetch } = useBranches(repositoryId);
  const defaultBranch = data.find((b) => b.isDefault);
  const protectedCount = data.filter((b) => b.protected).length;

  return (
    <WidgetCard
      title="Branches"
      loading={isLoading}
      error={isError ? "Could not load branches" : undefined}
      onRetry={() => void refetch()}
      empty={!isLoading && !isError && data.length === 0}
      description={!isLoading && data.length === 0 ? "No branches" : undefined}
      actions={
        <Button
          render={<Link href={routes.app.repositoryBranches(repositoryId)} />}
          size="sm"
          variant="outline"
        >
          View all
        </Button>
      }
    >
      <div className="flex flex-col gap-2 text-sm">
        <p>
          <span className="text-muted-foreground">Total</span>{" "}
          <span className="font-medium text-foreground">{data.length}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Default</span>{" "}
          <span className="font-medium text-foreground">
            {defaultBranch?.name ?? "—"}
          </span>
        </p>
        <p>
          <span className="text-muted-foreground">Protected</span>{" "}
          <span className="font-medium text-foreground">{protectedCount}</span>
        </p>
      </div>
    </WidgetCard>
  );
});

export { BranchSummaryWidget };
