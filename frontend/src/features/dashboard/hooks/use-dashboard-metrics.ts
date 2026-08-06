"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardKeys } from "../constants/dashboard.constants";
import { dashboardService } from "../services/dashboard.service";
import { useDashboardStore } from "../store/dashboard.store";

export function useDashboardMetrics() {
  const filters = useDashboardStore((s) => s.filters);

  return useQuery({
    queryKey: dashboardKeys.snapshot(filters),
    queryFn: () => dashboardService.getSnapshot(filters),
  });
}

export function useDashboardProjects() {
  const query = useDashboardMetrics();
  return {
    ...query,
    data: query.data?.projects,
  };
}

export function useDashboardActivity() {
  const query = useDashboardMetrics();
  return {
    ...query,
    data: query.data?.activity,
  };
}

export function useDashboardDeployments() {
  const query = useDashboardMetrics();
  return {
    ...query,
    data: query.data?.deployments,
  };
}

export function useDashboardFilterOptions() {
  return useQuery({
    queryKey: dashboardKeys.filterOptions(),
    queryFn: () => dashboardService.getFilterOptions(),
    staleTime: 60_000,
  });
}
