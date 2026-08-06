"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MEMBER_ROLE_LABELS } from "../constants/repository.constants";
import type { RepositoryMemberRole } from "../types/repository.types";

const ROLE_PERMISSIONS: Record<
  RepositoryMemberRole,
  { description: string; capabilities: string[] }
> = {
  owner: {
    description: "Full control including transfer and deletion.",
    capabilities: [
      "Manage settings",
      "Manage members & roles",
      "Push & merge",
      "Manage webhooks",
      "Delete repository",
    ],
  },
  maintainer: {
    description: "Manage code and repository configuration.",
    capabilities: [
      "Manage settings",
      "Manage webhooks",
      "Push & merge",
      "Manage releases",
      "Moderate pull requests",
    ],
  },
  developer: {
    description: "Contribute code and review pull requests.",
    capabilities: [
      "Push to non-protected branches",
      "Open pull requests",
      "Review pull requests",
      "Create branches & tags",
    ],
  },
  reporter: {
    description: "Read access with limited collaboration.",
    capabilities: ["Clone & pull", "View issues & PRs", "Comment"],
  },
  guest: {
    description: "Minimal read-only access.",
    capabilities: ["View public content", "Clone if allowed"],
  },
};

export interface RepositoryPermissionsProps {
  className?: string;
}

function RepositoryPermissions({ className }: RepositoryPermissionsProps) {
  const roles = Object.keys(MEMBER_ROLE_LABELS) as RepositoryMemberRole[];

  return (
    <div
      className={className}
      data-slot="repository-permissions"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((role) => {
          const meta = ROLE_PERMISSIONS[role];
          return (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="text-base">
                  {MEMBER_ROLE_LABELS[role]}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{meta.description}</p>
                <ul className="flex flex-col gap-1.5">
                  {meta.capabilities.map((cap) => (
                    <li key={cap} className="text-sm text-foreground">
                      · {cap}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { RepositoryPermissions };
