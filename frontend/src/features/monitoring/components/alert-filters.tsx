"use client";

import { SearchInput } from "@/components/forms/search-input";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";

import {
  ENVIRONMENT_OPTIONS,
  SERVICE_OPTIONS,
  SEVERITY_OPTIONS,
} from "../constants/monitoring.constants";
import { useMonitoringStore } from "../store/monitoring.store";
import type { AlertSeverity, Environment, ServiceKey } from "../types/monitoring.types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "triggered", label: "Triggered" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
  { value: "disabled", label: "Disabled" },
];

export interface AlertFiltersProps {
  className?: string;
  showEnvironment?: boolean;
}

function AlertFilters({ className, showEnvironment = true }: AlertFiltersProps) {
  const filters = useMonitoringStore((s) => s.filters);
  const setFilters = useMonitoringStore((s) => s.setFilters);
  const setSearch = useMonitoringStore((s) => s.setSearch);
  const resetFilters = useMonitoringStore((s) => s.resetFilters);

  return (
    <div
      className={className ?? "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"}
      data-slot="alert-filters"
    >
      <SearchInput
        label="Search alerts"
        value={filters.q}
        onChange={setSearch}
        placeholder="Search by name or service…"
        className="min-w-[200px] flex-1"
      />
      <SelectField
        label="Severity"
        value={filters.severity}
        onValueChange={(value) => {
          if (value) setFilters({ severity: value as AlertSeverity | "all" });
        }}
        options={SEVERITY_OPTIONS}
        className="w-full sm:w-[160px]"
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
      {showEnvironment ? (
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
      ) : null}
      <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
}

export { AlertFilters };
