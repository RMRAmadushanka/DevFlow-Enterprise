"use client";

import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell/app-shell";
import {
  sampleNotifications,
  sampleOrganizations,
  sampleProjects,
  sampleUser,
} from "@/components/layout/sample-data";

/**
 * Internal harness for the reusable application layout system — not a
 * feature/dashboard page. Wires `<AppShell>` with fixture data so the
 * layout primitives (sidebar, navbar, command menu, workspace switcher,
 * notifications, …) can be exercised end-to-end in the browser.
 */
export default function ShellPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      organizations={sampleOrganizations}
      projects={sampleProjects}
      activeOrganizationId={sampleOrganizations[0].id}
      activeProjectId={sampleProjects[0].id}
      onSelectOrganization={(id) => toast(`Switched organization: ${id}`)}
      onSelectProject={(id) => toast(`Switched project: ${id}`)}
      onCreateWorkspace={() => toast("Create workspace")}
      onWorkspaceSettingsClick={() => toast("Workspace settings")}
      user={sampleUser}
      onProfileClick={() => toast("Profile")}
      onAccountSettingsClick={() => toast("Account settings")}
      onLogout={() => toast("Log out")}
      breadcrumbs={[{ label: "Layout Preview" }]}
      notifications={sampleNotifications}
      onNotificationClick={(n) => toast(`Opened notification: ${n.title}`)}
      onMarkAllNotificationsRead={() => toast("Marked all as read")}
      onClearAllNotifications={() => toast("Cleared all notifications")}
    >
      {children}
    </AppShell>
  );
}
