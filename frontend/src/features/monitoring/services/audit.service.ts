import type {
  AuditLogEntry,
  MonitoringFilters,
  UserActivityRow,
} from "../types/monitoring.types";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const auditLogs: AuditLogEntry[] = [
  {
    id: "aud_1",
    timestamp: "2026-08-06T15:50:00.000Z",
    userId: "user_ava",
    userName: "Ava Chen",
    action: "repository.settings.update",
    resource: "acme/api-gateway",
    resourceType: "repository",
    ipAddress: "203.0.113.10",
    status: "success",
    environment: "production",
  },
  {
    id: "aud_2",
    timestamp: "2026-08-06T15:20:00.000Z",
    userId: "user_leo",
    userName: "Leo Martins",
    action: "deployment.create",
    resource: "api-gateway@1.4.0",
    resourceType: "deployment",
    ipAddress: "203.0.113.22",
    status: "success",
    environment: "production",
  },
  {
    id: "aud_3",
    timestamp: "2026-08-06T14:05:00.000Z",
    userId: "user_mia",
    userName: "Mia Patel",
    action: "alert.update",
    resource: "Task service error rate",
    resourceType: "alert",
    ipAddress: "198.51.100.8",
    status: "success",
    environment: "production",
  },
  {
    id: "aud_4",
    timestamp: "2026-08-06T11:40:00.000Z",
    userId: "user_noah",
    userName: "Noah Kim",
    action: "member.invite",
    resource: "sam@acme.com",
    resourceType: "organization",
    ipAddress: "198.51.100.44",
    status: "failure",
    environment: "staging",
  },
  {
    id: "aud_5",
    timestamp: "2026-08-05T18:00:00.000Z",
    userId: "user_ava",
    userName: "Ava Chen",
    action: "document.delete",
    resource: "Draft: Q4 Planning",
    resourceType: "document",
    ipAddress: "203.0.113.10",
    status: "success",
    environment: "production",
  },
];

const activity: UserActivityRow[] = [
  {
    id: "ua_1",
    userId: "user_ava",
    userName: "Ava Chen",
    logins: 18,
    projectActions: 42,
    taskActions: 65,
    deploymentActions: 12,
    documentActions: 28,
    lastActiveAt: "2026-08-06T15:50:00.000Z",
  },
  {
    id: "ua_2",
    userId: "user_leo",
    userName: "Leo Martins",
    logins: 14,
    projectActions: 30,
    taskActions: 48,
    deploymentActions: 22,
    documentActions: 10,
    lastActiveAt: "2026-08-06T15:20:00.000Z",
  },
  {
    id: "ua_3",
    userId: "user_mia",
    userName: "Mia Patel",
    logins: 11,
    projectActions: 24,
    taskActions: 55,
    deploymentActions: 4,
    documentActions: 36,
    lastActiveAt: "2026-08-06T14:05:00.000Z",
  },
];

export const auditService = {
  async list(filters: MonitoringFilters): Promise<AuditLogEntry[]> {
    await delay();
    return auditLogs.filter((entry) => {
      if (filters.environment !== "all" && entry.environment !== filters.environment) {
        return false;
      }
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.status !== "all" && entry.status !== filters.status) return false;
      const q = filters.q.trim().toLowerCase();
      if (
        q &&
        !`${entry.userName} ${entry.action} ${entry.resource}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  },

  async listUserActivity(): Promise<UserActivityRow[]> {
    await delay(160);
    return [...activity];
  },
};
