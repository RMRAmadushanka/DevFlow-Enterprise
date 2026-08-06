"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_TASK_FILTERS,
  TASK_STORAGE_KEY,
} from "../constants/task.constants";
import type {
  TaskFilters,
  TaskSortField,
  TaskStatus,
  TaskViewMode,
} from "../types/task.types";

interface TaskUiState {
  filters: TaskFilters;
  sort: TaskSortField;
  viewMode: TaskViewMode;
  collapsedColumns: TaskStatus[];
  selectedTaskIds: string[];
  activeTaskId: string | null;
  setFilters: (patch: Partial<TaskFilters>) => void;
  setSearch: (q: string) => void;
  setSort: (sort: TaskSortField) => void;
  setViewMode: (viewMode: TaskViewMode) => void;
  toggleColumnCollapsed: (status: TaskStatus) => void;
  setSelectedTaskIds: (ids: string[]) => void;
  setActiveTaskId: (id: string | null) => void;
  resetFilters: () => void;
}

export const useTaskStore = create<TaskUiState>()(
  persist(
    (set) => ({
      filters: DEFAULT_TASK_FILTERS,
      sort: "updated",
      viewMode: "board",
      collapsedColumns: [],
      selectedTaskIds: [],
      activeTaskId: null,
      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),
      setSearch: (q) => set((state) => ({ filters: { ...state.filters, q } })),
      setSort: (sort) => set({ sort }),
      setViewMode: (viewMode) => set({ viewMode }),
      toggleColumnCollapsed: (status) =>
        set((state) => ({
          collapsedColumns: state.collapsedColumns.includes(status)
            ? state.collapsedColumns.filter((item) => item !== status)
            : [...state.collapsedColumns, status],
        })),
      setSelectedTaskIds: (selectedTaskIds) => set({ selectedTaskIds }),
      setActiveTaskId: (activeTaskId) => set({ activeTaskId }),
      resetFilters: () => set({ filters: DEFAULT_TASK_FILTERS }),
    }),
    {
      name: TASK_STORAGE_KEY,
      partialize: (state) => ({
        viewMode: state.viewMode,
        sort: state.sort,
        collapsedColumns: state.collapsedColumns,
        filters: {
          projectId: state.filters.projectId,
          myTasks: state.filters.myTasks,
          archived: state.filters.archived,
        },
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<TaskUiState> | undefined;
        return {
          ...current,
          ...p,
          filters: { ...current.filters, ...p?.filters },
        };
      },
    }
  )
);
