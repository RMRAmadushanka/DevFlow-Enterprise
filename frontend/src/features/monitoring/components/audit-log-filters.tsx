"use client";

import { SearchInput } from "@/components/forms/search-input";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";

import { ENVIRONMENT_OPTIONS } from "../constants/monitoring.constants";
import { useMonitoringStore } from "../store/monitoring.store";
import type { Environment } from "../types/monitoring.types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
];

export interface AuditLogFiltersProps {
  className?: string;
}

function AuditLogFilters({ className }: AuditLogFiltersProps) {
  const filters = useMonitoringStore((s) => s.filters);
  const setFilters = useMonitoringStore((s) => s.setFilters);
  const setSearch = useMonitoringStore((s) => s.setSearch);
  const resetFilters = useMonitoringStore((s) => s.resetFilters);

  return (
    <div
      className={className ?? "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"}
      data-slot="audit-log-filters"
    >
      <SearchInput
        label="Search audit log"
        value={filters.q}
        onChange={setSearch}
        placeholder="Search user, action, resource…"
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
        label="Status"
        value={filters.status}
        onValueChange={(value) => {
          if (value) setFilters({ status: value });
        }}
        options={STATUS_OPTIONS}
        className="w-full sm:w-[160px]"
        size="sm"
      />
      <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
}

export { AuditLogFilters };
