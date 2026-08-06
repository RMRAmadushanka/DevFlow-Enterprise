"use client";

import { AlertTriangle } from "lucide-react";

import { UserAvatar } from "@/components/data-display/avatars";
import { ProgressBar } from "@/components/data-display/progress";
import { AlertBanner } from "@/components/feedback/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { SprintMemberCapacity } from "../types/sprint.types";

export interface CapacityPlanningCardProps {
  members: SprintMemberCapacity[];
  capacityPoints: number;
  allocatedPoints: number;
  className?: string;
}

function CapacityPlanningCard({
  members,
  capacityPoints,
  allocatedPoints,
  className,
}: CapacityPlanningCardProps) {
  const overAllocated = allocatedPoints > capacityPoints;
  const utilization =
    capacityPoints > 0 ? Math.min(100, Math.round((allocatedPoints / capacityPoints) * 100)) : 0;

  return (
    <Card className={cn(className)} data-slot="capacity-planning-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Team capacity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {overAllocated ? (
          <AlertBanner
            tone="warning"
            title="Over capacity"
            description={`Allocated ${allocatedPoints} points exceeds team capacity of ${capacityPoints}.`}
            icon={<AlertTriangle className="size-4" />}
          />
        ) : null}

        <ProgressBar
          value={utilization}
          label="Overall utilization"
          tone={overAllocated ? "danger" : utilization > 85 ? "warning" : "success"}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Member</th>
                <th className="pb-2 pr-4 font-medium">Capacity</th>
                <th className="pb-2 pr-4 font-medium">Allocated</th>
                <th className="pb-2 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const memberOver = member.allocatedPoints > member.capacityPoints;
                return (
                  <tr key={member.userId} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={{ name: member.name, imageUrl: member.avatarUrl }} size="sm" />
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">{member.capacityPoints}</td>
                    <td
                      className={cn(
                        "py-2.5 pr-4 tabular-nums",
                        memberOver && "font-medium text-danger"
                      )}
                    >
                      {member.allocatedPoints}
                    </td>
                    <td className="py-2.5 tabular-nums">{member.availability}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export { CapacityPlanningCard };
