"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { toast } from "@/components/feedback/toast";

import { monitoringKeys } from "../constants/monitoring.constants";
import { alertsService } from "../services/alerts.service";
import { analyticsService } from "../services/analytics.service";
import { auditService } from "../services/audit.service";
import { getIncident, listIncidents } from "../services/incidents-data";
import { metricsService } from "../services/metrics.service";
import { monitoringService } from "../services/monitoring.service";
import { useMonitoringStore } from "../store/monitoring.store";
import type {
  CreateAlertPayload,
  CreateReportPayload,
  UpdateAlertPayload,
} from "../types/monitoring.types";
import { toMonitoringErrorMessage } from "../utils/errors";

export function useMonitoring() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: monitoringKeys.overview(filters),
    queryFn: () => monitoringService.getOverview(filters),
  });
}

export function useMetrics() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: monitoringKeys.metrics(filters),
    queryFn: () => metricsService.list(filters),
  });
}

export function useServices() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: [...monitoringKeys.all, "services", filters] as const,
    queryFn: () => monitoringService.listServices(filters),
  });
}

export function useAlerts() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: monitoringKeys.alerts(filters),
    queryFn: () => alertsService.list(filters),
  });
}

export function useAlert(id: string | undefined) {
  return useQuery({
    queryKey: monitoringKeys.detail(id ?? "unknown"),
    queryFn: () => alertsService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAlertPayload) => alertsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: monitoringKeys.all });
      toast.success("Alert created");
    },
    onError: (error) => toast.error(toMonitoringErrorMessage(error)),
  });
}

export function useUpdateAlert(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAlertPayload) => alertsService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: monitoringKeys.all });
      toast.success("Alert updated");
    },
    onError: (error) => toast.error(toMonitoringErrorMessage(error)),
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: monitoringKeys.all });
      toast.success("Alert deleted");
    },
    onError: (error) => toast.error(toMonitoringErrorMessage(error)),
  });
}

export function useAlertHistory(id: string | undefined) {
  return useQuery({
    queryKey: [...monitoringKeys.detail(id ?? "unknown"), "history"] as const,
    queryFn: () => alertsService.history(id!),
    enabled: Boolean(id),
  });
}

export function useIncidents() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: monitoringKeys.incidents(filters),
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 180));
      return listIncidents(filters);
    },
  });
}

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: [...monitoringKeys.all, "incident", id] as const,
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 120));
      return getIncident(id!);
    },
    enabled: Boolean(id),
  });
}

export function useErrors() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: monitoringKeys.errors(filters),
    queryFn: () => monitoringService.listErrors(filters),
  });
}

export function useTrackedError(id: string | undefined) {
  return useQuery({
    queryKey: [...monitoringKeys.all, "error", id] as const,
    queryFn: () => monitoringService.getError(id!),
    enabled: Boolean(id),
  });
}

export function useAuditLogs() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: monitoringKeys.audit(filters),
    queryFn: () => auditService.list(filters),
  });
}

export function useUserActivity() {
  return useQuery({
    queryKey: monitoringKeys.activity(),
    queryFn: () => auditService.listUserActivity(),
  });
}

export function useAnalytics() {
  const filters = useMonitoringStore((s) => s.filters);
  return useQuery({
    queryKey: monitoringKeys.analytics(filters),
    queryFn: () => analyticsService.getOverview(filters),
  });
}

export function useReports() {
  return useQuery({
    queryKey: monitoringKeys.reports(),
    queryFn: () => analyticsService.listReports(),
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => analyticsService.createReport(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: monitoringKeys.reports() });
      toast.success("Report created");
    },
    onError: (error) => toast.error(toMonitoringErrorMessage(error)),
  });
}

export function useExportReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: "pdf" | "csv" }) =>
      analyticsService.exportReport(id, format),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: monitoringKeys.reports() });
      toast.success(`Export started (${result.format.toUpperCase()})`);
    },
    onError: (error) => toast.error(toMonitoringErrorMessage(error)),
  });
}

/** Convenience: stable filter object for dependent queries */
export function useMonitoringFilters() {
  const filters = useMonitoringStore((s) => s.filters);
  return React.useMemo(() => filters, [filters]);
}
