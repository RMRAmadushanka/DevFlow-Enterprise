import type { TabItem } from "@/components/navigation/tabs";
import { routes } from "@/config/routes";

import { PROJECT_DETAIL_TABS } from "../constants/project.constants";

export interface ProjectDetailTabItem extends TabItem {
  href: string;
}

function projectTabHref(projectId: string, tab: (typeof PROJECT_DETAIL_TABS)[number]["value"]): string {
  switch (tab) {
    case "overview":
      return routes.app.project(projectId);
    case "activity":
      return routes.app.projectActivity(projectId);
    case "members":
      return routes.app.projectMembers(projectId);
    case "analytics":
      return routes.app.projectAnalytics(projectId);
    case "repository":
      return routes.app.projectRepository(projectId);
    case "settings":
      return routes.app.projectSettings(projectId);
    case "deployments":
      return routes.app.projectEnvironments(projectId);
    case "tasks":
      return routes.app.projectTasks(projectId);
    case "sprints":
      return routes.app.projectSprints(projectId);
    default:
      return `${routes.app.project(projectId)}/${tab}`;
  }
}

export function getProjectDetailTabs(projectId: string): ProjectDetailTabItem[] {
  return PROJECT_DETAIL_TABS.map((tab) => ({
    value: tab.value,
    label: tab.label,
    href: projectTabHref(projectId, tab.value),
  }));
}

export function getActiveProjectTab(pathname: string, projectId: string): string {
  const tabs = getProjectDetailTabs(projectId);
  const matches = tabs
    .filter((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
    .sort((a, b) => b.href.length - a.href.length);
  if (matches[0]) return matches[0].value;

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const known = PROJECT_DETAIL_TABS.find((tab) => tab.value === last);
  return known?.value ?? "overview";
}
