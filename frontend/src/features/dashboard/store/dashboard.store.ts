"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DateRangeValue } from "@/components/dashboard";

import {
  DASHBOARD_STORAGE_KEY,
  DEFAULT_DASHBOARD_PREFERENCES,
} from "../constants/dashboard.constants";
import type {
  DashboardFilters,
  DashboardPreferences,
  DashboardWidgetId,
  DashboardEnvironment,
} from "../types/dashboard.types";

interface DashboardUiState {
  filters: DashboardFilters;
  preferences: DashboardPreferences;
  projectViewMode: "table" | "cards";
  setDateRange: (dateRange: DateRangeValue) => void;
  setFilter: <K extends keyof Omit<DashboardFilters, "dateRange">>(
    key: K,
    value: DashboardFilters[K]
  ) => void;
  setFilters: (patch: Partial<DashboardFilters>) => void;
  setPreferences: (preferences: Partial<DashboardPreferences>) => void;
  toggleWidget: (id: DashboardWidgetId) => void;
  setWidgetOrder: (order: DashboardWidgetId[]) => void;
  setProjectViewMode: (mode: "table" | "cards") => void;
  resetPreferences: () => void;
}

const defaultFilters: DashboardFilters = {
  organizationId: null,
  teamId: null,
  projectId: null,
  environment: null,
  dateRange: { preset: "30d" },
};

export const useDashboardStore = create<DashboardUiState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      preferences: DEFAULT_DASHBOARD_PREFERENCES,
      projectViewMode: "table",
      setDateRange: (dateRange) =>
        set((state) => ({ filters: { ...state.filters, dateRange } })),
      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),
      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),
      toggleWidget: (id) =>
        set((state) => {
          const visible = state.preferences.visibleWidgets.includes(id)
            ? state.preferences.visibleWidgets.filter((item) => item !== id)
            : [...state.preferences.visibleWidgets, id];
          return {
            preferences: { ...state.preferences, visibleWidgets: visible },
          };
        }),
      setWidgetOrder: (widgetOrder) =>
        set((state) => ({
          preferences: { ...state.preferences, widgetOrder },
        })),
      setProjectViewMode: (projectViewMode) => set({ projectViewMode }),
      resetPreferences: () =>
        set({
          preferences: DEFAULT_DASHBOARD_PREFERENCES,
          projectViewMode: "table",
        }),
    }),
    {
      name: DASHBOARD_STORAGE_KEY,
      partialize: (state) => ({
        preferences: state.preferences,
        filters: {
          organizationId: state.filters.organizationId,
          dateRange: state.filters.dateRange,
          environment: state.filters.environment as DashboardEnvironment | null,
        },
        projectViewMode: state.projectViewMode,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<DashboardUiState> | undefined;
        return {
          ...current,
          ...p,
          filters: { ...current.filters, ...p?.filters },
          preferences: {
            ...DEFAULT_DASHBOARD_PREFERENCES,
            ...p?.preferences,
          },
        };
      },
    }
  )
);
