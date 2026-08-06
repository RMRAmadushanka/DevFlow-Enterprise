"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { SearchInput } from "@/components/forms/search-input";
import { Button } from "@/components/ui/button";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { ConfirmModal } from "@/components/feedback/modal";
import { routes } from "@/config/routes";
import {
  OrganizationCard,
  OrganizationGridSkeleton,
  useLeaveOrganization,
  useOrganizations,
  type Organization,
} from "@/features/organization";

export default function OrganizationsPage() {
  const [query, setQuery] = React.useState("");
  const { data = [], isLoading, isError } = useOrganizations({ q: query });
  const leave = useLeaveOrganization();
  const [leaveTarget, setLeaveTarget] = React.useState<Organization | null>(null);

  return (
    <ListPageTemplate
      title="Organizations"
      description="Organizations you belong to across DevFlow Enterprise."
      breadcrumbs={[
        { label: "Workspace", href: routes.app.home },
        { label: "Organizations" },
      ]}
      actions={
        <Button render={<Link href={routes.app.organizationNew} />}>
          <Plus className="size-4" />
          New organization
        </Button>
      }
      filters={
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search organizations"
          label="Search organizations"
          className="max-w-md"
        />
      }
      loading={isLoading}
      empty={
        isError ? (
          <FeatureEmptyState
            variant="no-results"
            title="Could not load organizations"
            description="Check your connection and try again."
          />
        ) : data.length === 0 ? (
          <FeatureEmptyState
            variant="no-data"
            title="No organizations"
            description="Create an organization to start collaborating with your team."
            action={
              <Button render={<Link href={routes.app.organizationNew} />}>
                Create organization
              </Button>
            }
          />
        ) : null
      }
    >
      {isLoading ? (
        <OrganizationGridSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              onLeave={setLeaveTarget}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(leaveTarget)}
        onOpenChange={(open) => {
          if (!open) setLeaveTarget(null);
        }}
        title="Leave organization?"
        description={
          leaveTarget
            ? `You will lose access to ${leaveTarget.name} until invited again.`
            : undefined
        }
        confirmLabel="Leave"
        variant="danger"
        onConfirm={() => {
          if (!leaveTarget) return;
          void leave.mutateAsync(leaveTarget.id).then(() => setLeaveTarget(null));
        }}
      />
    </ListPageTemplate>
  );
}
