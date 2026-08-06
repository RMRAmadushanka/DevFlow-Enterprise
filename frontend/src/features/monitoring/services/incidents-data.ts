import type { Incident, MonitoringFilters } from "../types/monitoring.types";

const incidents: Incident[] = [
  {
    id: "inc_1",
    number: "INC-214",
    title: "Elevated deployment API latency",
    severity: "high",
    status: "investigating",
    affectedServices: ["deployments", "notifications"],
    ownerName: "Leo Martins",
    ownerId: "user_leo",
    createdAt: "2026-08-06T14:30:00.000Z",
    relatedAlertIds: ["alert_1"],
    timeline: [
      {
        id: "ie_1",
        timestamp: "2026-08-06T14:30:00.000Z",
        actorName: "Monitor Bot",
        summary: "Incident opened from alert “API latency p95 elevated”",
        type: "detected",
      },
      {
        id: "ie_2",
        timestamp: "2026-08-06T14:45:00.000Z",
        actorName: "Leo Martins",
        summary: "Investigating upstream timeout in deploy-api",
        type: "update",
      },
      {
        id: "ie_3",
        timestamp: "2026-08-06T15:20:00.000Z",
        actorName: "Ava Chen",
        summary: "Scaled deploy-api replicas; latency improving",
        type: "mitigation",
      },
    ],
  },
  {
    id: "inc_2",
    number: "INC-210",
    title: "Task board client crash spike",
    severity: "critical",
    status: "mitigating",
    affectedServices: ["tasks"],
    ownerName: "Mia Patel",
    ownerId: "user_mia",
    createdAt: "2026-08-06T12:00:00.000Z",
    relatedAlertIds: ["alert_2"],
    timeline: [
      {
        id: "ie_4",
        timestamp: "2026-08-06T12:00:00.000Z",
        actorName: "Monitor Bot",
        summary: "Error volume exceeded critical threshold",
        type: "detected",
      },
      {
        id: "ie_5",
        timestamp: "2026-08-06T12:30:00.000Z",
        actorName: "Mia Patel",
        summary: "Feature flag disabled for experimental board layout",
        type: "mitigation",
      },
    ],
    postmortemSummary: "Pending — draft after full resolution.",
  },
  {
    id: "inc_3",
    number: "INC-198",
    title: "Auth availability dip (resolved)",
    severity: "critical",
    status: "resolved",
    affectedServices: ["authentication"],
    ownerName: "Noah Kim",
    ownerId: "user_noah",
    createdAt: "2026-07-28T15:00:00.000Z",
    resolvedAt: "2026-07-28T17:10:00.000Z",
    relatedAlertIds: ["alert_4"],
    timeline: [
      {
        id: "ie_6",
        timestamp: "2026-07-28T15:00:00.000Z",
        actorName: "Monitor Bot",
        summary: "Availability dropped below 99.5%",
        type: "detected",
      },
      {
        id: "ie_7",
        timestamp: "2026-07-28T17:10:00.000Z",
        actorName: "Noah Kim",
        summary: "Resolved after redis failover",
        type: "resolved",
      },
    ],
    postmortemSummary: "Redis primary failover delayed health checks; runbook updated.",
  },
];

export async function listIncidents(filters: MonitoringFilters): Promise<Incident[]> {
  return incidents.filter((incident) => {
    if (
      filters.service !== "all" &&
      !incident.affectedServices.includes(filters.service)
    ) {
      return false;
    }
    if (filters.severity !== "all" && incident.severity !== filters.severity) return false;
    if (filters.status !== "all" && incident.status !== filters.status) return false;
    const q = filters.q.trim().toLowerCase();
    if (
      q &&
      !`${incident.title} ${incident.number} ${incident.ownerName}`.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
}

export async function getIncident(id: string): Promise<Incident | undefined> {
  return incidents.find((i) => i.id === id);
}

export { incidents as INCIDENTS_SEED };
