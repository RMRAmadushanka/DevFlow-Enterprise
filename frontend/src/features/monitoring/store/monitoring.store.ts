"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_DASHBOARD_WIDGETS,
  DEFAULT_MONITORING_FILTERS,
  MONITORING_STORAGE_KEY,
} from "../constants/monitoring.constants";
import type {
  DashboardWidgetId,
  MonitoringFilters,
} from "../types/monitoring.types";

interface MonitoringUiState {
  filters: MonitoringFilters;
  selectedIncidentId: string | null;
  selectedErrorId: string | null;
  selectedAlertId: string | null;
  dashboardWidgets: DashboardWidgetId[];
  chartZoomEnabled: boolean;
  setFilters: (patch: Partial<MonitoringFilters>) => void;
  setSearch: (q: string) => void;
  setSelectedIncidentId: (id: string | null) => void;
  setSelectedErrorId: (id: string | null) => void;
  setSelectedAlertId: (id: string | null) => void;
  setDashboardWidgets: (widgets: DashboardWidgetId[]) => void;
  toggleWidget: (id: DashboardWidgetId) => void;
  reorderWidgets: (widgets: DashboardWidgetId[]) => void;
  setChartZoomEnabled: (enabled: boolean) => void;
  resetFilters: () => void;
}

export const useMonitoringStore = create<MonitoringUiState>()(
  persist(
    (set) => ({
      filters: DEFAULT_MONITORING_FILTERS,
      selectedIncidentId: null,
      selectedErrorId: null,
      selectedAlertId: null,
      dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
      chartZoomEnabled: false,
      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),
      setSearch: (q) => set((state) => ({ filters: { ...state.filters, q } })),
      setSelectedIncidentId: (selectedIncidentId) => set({ selectedIncidentId }),
      setSelectedErrorId: (selectedErrorId) => set({ selectedErrorId }),
      setSelectedAlertId: (selectedAlertId) => set({ selectedAlertId }),
      setDashboardWidgets: (dashboardWidgets) => set({ dashboardWidgets }),
      toggleWidget: (id) =>
        set((state) => ({
          dashboardWidgets: state.dashboardWidgets.includes(id)
            ? state.dashboardWidgets.filter((w) => w !== id)
            : [...state.dashboardWidgets, id],
        })),
      reorderWidgets: (dashboardWidgets) => set({ dashboardWidgets }),
      setChartZoomEnabled: (chartZoomEnabled) => set({ chartZoomEnabled }),
      resetFilters: () => set({ filters: DEFAULT_MONITORING_FILTERS }),
    }),
    {
      name: MONITORING_STORAGE_KEY,
      partialize: (state) => ({
        dashboardWidgets: state.dashboardWidgets,
        chartZoomEnabled: state.chartZoomEnabled,
        filters: {
          environment: state.filters.environment,
          service: state.filters.service,
          severity: state.filters.severity,
        },
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<MonitoringUiState> | undefined;
        return {
          ...current,
          ...p,
          filters: { ...current.filters, ...p?.filters },
        };
      },
    }
  )
);
