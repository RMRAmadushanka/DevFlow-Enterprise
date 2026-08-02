import type { Organization, Project } from "@/components/layout/workspace-switcher/types";
import type { AppUser } from "@/components/layout/user-menu/types";
import type { NotificationItem } from "@/components/layout/notification-center/types";

/**
 * Fixture data for the internal layout preview route and component
 * tests only. Nothing in `src/components/layout/**` imports this file —
 * every component is fully prop-driven; a consuming app supplies its own
 * real data instead.
 */
export const sampleOrganizations: Organization[] = [
  { id: "org-acme", name: "Acme Corporation", meta: "Enterprise plan" },
  { id: "org-globex", name: "Globex Industries", meta: "Team plan" },
];

export const sampleProjects: Project[] = [
  { id: "proj-travel", name: "Travel Platform", organizationId: "org-acme" },
  { id: "proj-billing", name: "Billing Service", organizationId: "org-acme" },
  { id: "proj-atlas", name: "Atlas Mobile", organizationId: "org-globex" },
];

export const sampleUser: AppUser = {
  id: "user-1",
  name: "Jordan Lee",
  email: "jordan.lee@acme.com",
  role: "Admin",
};

export const sampleNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Deployment succeeded",
    description: "travel-platform@2.14.0 deployed to production.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    read: false,
  },
  {
    id: "notif-2",
    title: "New comment on Task #482",
    description: "Priya Shah commented on \"Fix pagination bug\".",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: false,
  },
  {
    id: "notif-3",
    title: "Build failed",
    description: "billing-service #219 failed on the test stage.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
    read: true,
  },
];
