"use client";

import { useMutation } from "@tanstack/react-query";

import { toast } from "@/components/feedback/toast";
import type { ExportFormat } from "@/components/dashboard";

import { dashboardService } from "../services/dashboard.service";
import { useDashboardStore } from "../store/dashboard.store";
import type { DashboardWidgetId } from "../types/dashboard.types";

export function useDashboardPreferences() {
  const preferences = useDashboardStore((s) => s.preferences);
  const setPreferences = useDashboardStore((s) => s.setPreferences);
  const toggleWidget = useDashboardStore((s) => s.toggleWidget);
  const setWidgetOrder = useDashboardStore((s) => s.setWidgetOrder);
  const resetPreferences = useDashboardStore((s) => s.resetPreferences);
  const projectViewMode = useDashboardStore((s) => s.projectViewMode);
  const setProjectViewMode = useDashboardStore((s) => s.setProjectViewMode);

  const isVisible = (id: DashboardWidgetId) => preferences.visibleWidgets.includes(id);

  const orderedVisibleWidgets = preferences.widgetOrder.filter((id) =>
    preferences.visibleWidgets.includes(id)
  );

  return {
    preferences,
    projectViewMode,
    orderedVisibleWidgets,
    isVisible,
    setPreferences,
    toggleWidget,
    setWidgetOrder,
    resetPreferences,
    setProjectViewMode,
  };
}

export function useExportDashboardReport() {
  return useMutation({
    mutationFn: (format: ExportFormat) => dashboardService.exportReport(format),
    onSuccess: (result) => {
      toast.success(`Report ready`, { description: result.filename });
    },
    onError: () => toast.error("Export failed"),
  });
}
