import { apiClient } from "../client";
import type { DashboardSnapshotDto, VelocityTrendPointDto } from "../types/analytics";

/** Typed Gateway client for analytics-service (`/api/v1/analytics`). */
export const analyticsApi = {
  getVelocityTrend(
    organizationId?: string,
    projectId?: string,
    limit?: number
  ): Promise<VelocityTrendPointDto[]> {
    return apiClient<VelocityTrendPointDto[]>("/api/v1/analytics/velocity-trend", {
      query: { organizationId, projectId, limit },
    });
  },

  getDashboardSnapshot(
    organizationId?: string,
    projectId?: string
  ): Promise<DashboardSnapshotDto> {
    return apiClient<DashboardSnapshotDto>("/api/v1/analytics/dashboard-snapshot", {
      query: { organizationId, projectId },
    });
  },
};
