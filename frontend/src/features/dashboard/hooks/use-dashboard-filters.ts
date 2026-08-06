"use client";

import { useDashboardStore } from "../store/dashboard.store";
import { useDashboardFilterOptions } from "./use-dashboard-metrics";

export function useDashboardFilters() {
  const filters = useDashboardStore((s) => s.filters);
  const setDateRange = useDashboardStore((s) => s.setDateRange);
  const setFilter = useDashboardStore((s) => s.setFilter);
  const setFilters = useDashboardStore((s) => s.setFilters);
  const optionsQuery = useDashboardFilterOptions();

  return {
    filters,
    options: optionsQuery.data,
    isLoadingOptions: optionsQuery.isLoading,
    setDateRange,
    setFilter,
    setFilters,
  };
}
