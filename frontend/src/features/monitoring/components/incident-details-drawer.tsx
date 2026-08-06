"use client";

import { StatusBadge } from "@/components/data-display/badges";
import { DetailDrawer } from "@/components/feedback/drawer";

import { SERVICE_LABELS, SEVERITY_LABELS } from "../constants/monitoring.constants";
import { useIncident } from "../hooks/use-monitoring";
import { formatTimestamp } from "../utils/format";
import { INCIDENT_STATUS_TONE, SEVERITY_TONE } from "./shared";
import { IncidentTimeline } from "./incident-timeline";
import { AlertCardSkeleton } from "./monitoring-skeleton";

export interface IncidentDetailsDrawerProps {
  incidentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function IncidentDetailsDrawer({
  incidentId,
  open,
  onOpenChange,
}: IncidentDetailsDrawerProps) {
  const { data: incident, isLoading } = useIncident(incidentId ?? undefined);

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={incident ? `${incident.number} · ${incident.title}` : "Incident"}
      size="lg"
    >
      {isLoading ? <AlertCardSkeleton /> : null}
      {!isLoading && incident ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={SEVERITY_TONE[incident.severity]} size="sm" dot>
              {SEVERITY_LABELS[incident.severity]}
            </StatusBadge>
            <StatusBadge tone={INCIDENT_STATUS_TONE[incident.status]} size="sm">
              {incident.status}
            </StatusBadge>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="text-foreground">{incident.ownerName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Opened</dt>
              <dd className="text-foreground">{formatTimestamp(incident.createdAt)}</dd>
            </div>
            {incident.resolvedAt ? (
              <div>
                <dt className="text-muted-foreground">Resolved</dt>
                <dd className="text-foreground">{formatTimestamp(incident.resolvedAt)}</dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Affected services</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {incident.affectedServices.map((key) => (
                  <StatusBadge key={key} tone="neutral" size="sm">
                    {SERVICE_LABELS[key]}
                  </StatusBadge>
                ))}
              </dd>
            </div>
          </dl>

          {incident.postmortemSummary ? (
            <div>
              <h3 className="text-sm font-semibold text-foreground">Postmortem</h3>
              <p className="mt-1 text-sm text-muted-foreground">{incident.postmortemSummary}</p>
            </div>
          ) : null}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Timeline</h3>
            <IncidentTimeline events={incident.timeline} />
          </div>
        </div>
      ) : null}
    </DetailDrawer>
  );
}

export { IncidentDetailsDrawer };
