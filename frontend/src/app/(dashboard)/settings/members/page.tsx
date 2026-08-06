"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import {
  InviteMemberModal,
  MemberTable,
  OrganizationSettingsShell,
  OrganizationSettingsSkeleton,
  useCurrentOrganization,
} from "@/features/organization";

export default function OrganizationMembersSettingsPage() {
  const { organizationId, isLoading } = useCurrentOrganization();
  const [inviteOpen, setInviteOpen] = React.useState(false);

  if (isLoading || !organizationId) {
    return (
      <OrganizationSettingsShell title="Members" description="Invite and manage members">
        <OrganizationSettingsSkeleton />
      </OrganizationSettingsShell>
    );
  }

  return (
    <OrganizationSettingsShell
      title="Members"
      description="Invite teammates, change roles, and manage access"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <PermissionGuard permission="member.invite">
            <Button type="button" onClick={() => setInviteOpen(true)}>
              <Plus className="size-4" />
              Invite member
            </Button>
          </PermissionGuard>
        </div>
        <MemberTable organizationId={organizationId} />
      </div>
      <InviteMemberModal
        organizationId={organizationId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </OrganizationSettingsShell>
  );
}
