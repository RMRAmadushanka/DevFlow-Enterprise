"use client";

import { FolderKanban, HardDrive, Users, CalendarDays } from "lucide-react";

import { formatCompactNumber } from "@/components/data-display/shared/formatters";

import type { OrganizationStats } from "../types/organization.types";

export interface OrganizationStatsProps {
  stats: OrganizationStats;
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function OrganizationStatsCards({ stats }: OrganizationStatsProps) {
  const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(stats.createdAt)
  );

  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      data-slot="organization-stats"
      aria-label="Organization statistics"
    >
      <StatItem
        icon={Users}
        label="Total members"
        value={formatCompactNumber(stats.totalMembers)}
      />
      <StatItem
        icon={FolderKanban}
        label="Active projects"
        value={formatCompactNumber(stats.activeProjects)}
      />
      <StatItem
        icon={HardDrive}
        label="Storage usage"
        value={`${stats.storageUsedGb.toFixed(1)} / ${stats.storageLimitGb} GB`}
      />
      <StatItem icon={CalendarDays} label="Created" value={created} />
    </div>
  );
}

export { OrganizationStatsCards as OrganizationStats };
