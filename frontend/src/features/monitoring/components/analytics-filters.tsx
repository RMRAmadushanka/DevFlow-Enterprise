"use client";

import { SearchInput } from "@/components/forms/search-input";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";

import {
  ENVIRONMENT_OPTIONS,
  SERVICE_OPTIONS,
} from "../constants/monitoring.constants";
import { useMonitoringStore } from "../store/monitoring.store";
import type { Environment, ServiceKey } from "../types/monitoring.types";

export interface AnalyticsFiltersProps {
  className?: string;
}

function AnalyticsFilters({ className }: AnalyticsFiltersProps) {
  const filters = useMonitoringStore((s) => s.filters);
  const setFilters = useMonitoringStore((s) => s.setFilters);
  const setSearch = useMonitoringStore((s) => s.setSearch);
  const resetFilters = useMonitoringStore((s) => s.resetFilters);

  return (
    <div
      className={className ?? "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"}
      data-slot="analytics-filters"
    >
      <SearchInput
        label="Search analytics"
        value={filters.q}
        onChange={setSearch}
        placeholder="Filter overview…"
        className="min-w-[200px] flex-1"
      />
      <SelectField
        label="Environment"
        value={filters.environment}
        onValueChange={(value) => {
          if (value) setFilters({ environment: value as Environment | "all" });
        }}
        options={ENVIRONMENT_OPTIONS}
        className="w-full sm:w-[180px]"
        size="sm"
      />
      <SelectField
        label="Service"
        value={filters.service}
        onValueChange={(value) => {
          if (value) setFilters({ service: value as ServiceKey | "all" });
        }}
        options={SERVICE_OPTIONS}
        className="w-full sm:w-[180px]"
        size="sm"
      />
      <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
}

export { AnalyticsFilters };
