/**
 * DTO shapes matching analytics-service `/api/v1/analytics`.
 *
 * Confirmed against the live analytics-service response (not speculative):
 * the dashboard snapshot's `sprint` field is a thin projection of raw sprint
 * fields — no precomputed UI metrics (completion %, remaining days, task
 * counts) are sent. Those must be derived client-side in the mapper.
 */

export interface VelocityTrendPointDto {
  sprintId: string;
  sprintName: string;
  committedPoints: number | null;
  completedPoints: number | null;
  endDate: string;
}

export interface DashboardSnapshotBurndownPointDto {
  date: string;
  remainingPoints: number | null;
  idealPoints: number | null;
  completedPoints: number | null;
}

export interface DashboardSnapshotSprintDto {
  sprintId: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  committedPoints: number | null;
  completedPoints: number | null;
  velocity: number | null;
  health: string;
}

export interface DashboardSnapshotDto {
  sprint: DashboardSnapshotSprintDto | null;
  burndown: DashboardSnapshotBurndownPointDto[];
}

export interface VelocityTrendQuery {
  organizationId?: string;
  projectId?: string;
  limit?: number;
}

export interface DashboardSnapshotQuery {
  organizationId?: string;
  projectId?: string;
}
