"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Settings, Users } from "lucide-react";

import { DetailPageTemplate } from "@/components/layout/page-templates";
import { Button } from "@/components/ui/button";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";
import {
  AuditLogTable,
  MemberTable,
  OrganizationHeader,
  OrganizationSettingsSkeleton,
  OrganizationStats,
  RecentActivity,
  RoleBadge,
  TeamSettings,
  useOrganization,
  useOrganizationStats,
  useOrganizationStore,
  InviteMemberModal,
} from "@/features/organization";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "members", label: "Members" },
  { value: "teams", label: "Teams" },
  { value: "settings", label: "Settings" },
  { value: "audit", label: "Audit Logs" },
];

export default function OrganizationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: organization, isLoading, isError } = useOrganization(id);
  const { data: stats } = useOrganizationStats(id);
  const switchOrganization = useOrganizationStore((s) => s.switchOrganization);
  const [tab, setTab] = React.useState("overview");
  const [inviteOpen, setInviteOpen] = React.useState(false);

  React.useEffect(() => {
    if (organization) switchOrganization(organization.id);
  }, [organization, switchOrganization]);

  if (isLoading) {
    return (
      <div className="p-6">
        <OrganizationSettingsSkeleton />
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Organization not found"
        description="This organization may have been deleted or you no longer have access."
        action={
          <Button render={<Link href={routes.app.organizations} />}>
            Back to organizations
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DetailPageTemplate
        title={organization.name}
        description={organization.description}
        breadcrumbs={[
          { label: "Organizations", href: routes.app.organizations },
          { label: organization.name },
        ]}
        status={<RoleBadge role={organization.myRole} />}
        actions={
          <>
            <PermissionGuard permission="member.invite">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(true)}>
                <Users className="size-4" />
                Invite
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={["organization.update", "org.manage"]}>
              <Button
                render={<Link href={routes.app.settings.organization} />}
                variant="outline"
              >
                <Settings className="size-4" />
                Settings
              </Button>
            </PermissionGuard>
          </>
        }
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
      >
        {tab === "overview" ? (
          <div className="flex flex-col gap-6">
            <OrganizationHeader organization={organization} />
            {stats ? <OrganizationStats stats={stats} /> : null}
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold">Recent activity</h2>
              <RecentActivity organizationId={organization.id} />
            </section>
          </div>
        ) : null}

        {tab === "members" ? <MemberTable organizationId={organization.id} /> : null}

        {tab === "teams" ? (
          <TeamSettings organizationId={organization.id} showHeaderLink />
        ) : null}

        {tab === "settings" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Manage general settings, members, and roles from the organization settings area.
            </p>
            <Button
              type="button"
              onClick={() => router.push(routes.app.settings.organization)}
            >
              Open organization settings
            </Button>
          </div>
        ) : null}

        {tab === "audit" ? <AuditLogTable organizationId={organization.id} /> : null}
      </DetailPageTemplate>

      <InviteMemberModal
        organizationId={organization.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </>
  );
}
