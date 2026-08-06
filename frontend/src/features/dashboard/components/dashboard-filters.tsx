"use client";

import * as React from "react";

import { ChartFilter, DateRangeSelector } from "@/components/dashboard";
import type { ChartFilterDefinition } from "@/components/dashboard";

import { DATE_RANGE_PRESETS } from "../constants/dashboard.constants";
import { useDashboardFilters } from "../hooks/use-dashboard-filters";
import type { DashboardEnvironment } from "../types/dashboard.types";

function DashboardFilters() {
  const { filters, options, isLoadingOptions, setDateRange, setFilters } = useDashboardFilters();

  const filterDefs = React.useMemo<ChartFilterDefinition[]>(() => {
    if (!options) return [];
    return [
      {
        id: "organizationId",
        label: "Organization",
        placeholder: "All organizations",
        options: options.organizations,
      },
      {
        id: "teamId",
        label: "Team",
        placeholder: "All teams",
        options: options.teams,
      },
      {
        id: "projectId",
        label: "Project",
        placeholder: "All projects",
        options: options.projects,
      },
      {
        id: "environment",
        label: "Environment",
        placeholder: "All environments",
        options: options.environments.map((item) => ({
          value: item.value,
          label: item.label,
        })),
      },
    ];
  }, [options]);

  const filterValues = React.useMemo(
    () => ({
      organizationId: filters.organizationId,
      teamId: filters.teamId,
      projectId: filters.projectId,
      environment: filters.environment,
    }),
    [filters]
  );

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:p-4"
      data-slot="dashboard-filters"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <ChartFilter
          label="Dashboard filters"
          filters={filterDefs}
          value={filterValues}
          disabled={isLoadingOptions}
          onChange={(next) => {
            setFilters({
              organizationId: next.organizationId ?? null,
              teamId: next.teamId ?? null,
              projectId: next.projectId ?? null,
              environment: (next.environment as DashboardEnvironment | null) ?? null,
            });
          }}
        />
        <DateRangeSelector
          value={filters.dateRange}
          onChange={setDateRange}
          presets={DATE_RANGE_PRESETS}
          allowCustom={false}
          label="Date range"
        />
      </div>
    </div>
  );
}

export { DashboardFilters };
