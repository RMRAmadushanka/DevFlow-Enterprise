import {
  Activity,
  ChartNoAxesColumn,
  CircleHelp,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Rocket,
  Settings,
  SquareCheck,
} from "lucide-react";

import type { NavGroup } from "./types";

/**
 * Default primary navigation, per the DevFlow Enterprise sidebar spec.
 * This is presentational configuration (labels/icons/routes), not business
 * data — `<Sidebar navGroups={…}>` accepts an override, so a consuming
 * app can swap this out entirely without touching the layout system.
 */
export const defaultNavGroups: NavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "projects", label: "Projects", href: "/projects", icon: FolderKanban },
      { id: "tasks", label: "Tasks", href: "/tasks", icon: SquareCheck, badge: 12 },
      { id: "sprints", label: "Sprints", href: "/sprints", icon: Gauge },
      { id: "documents", label: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    items: [
      { id: "repositories", label: "Repositories", href: "/repositories", icon: GitBranch },
      { id: "deployments", label: "Deployments", href: "/deployments", icon: Rocket },
      { id: "monitoring", label: "Monitoring", href: "/monitoring", icon: Activity },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: ChartNoAxesColumn },
    ],
  },
];

/** Bottom-section utility navigation — rendered below the main nav, above the user menu. */
export const defaultFooterNavItems: NavGroup = {
  id: "system",
  label: "System",
  items: [
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
    { id: "help", label: "Help & Support", href: "/help", icon: CircleHelp },
  ],
};
