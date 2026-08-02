"use client";

import { ChevronsUpDown, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { iconSize } from "@/design-system/tokens/icons";
import { cn } from "@/lib/utils";
import { CreateWorkspaceButton } from "./create-workspace-button";
import { WorkspaceAvatar } from "./workspace-avatar";
import { WorkspaceItem } from "./workspace-item";
import type { Organization, Project } from "./types";

export interface WorkspaceSwitcherProps {
  organizations: Organization[];
  projects: Project[];
  activeOrganizationId: string;
  activeProjectId?: string;
  collapsed?: boolean;
  onSelectOrganization?: (organizationId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onCreateWorkspace?: () => void;
  onSettingsClick?: () => void;
}

/**
 * Multi-organization / multi-project switcher rendered at the top of the
 * sidebar (below the header). Fully data-driven — pass real organizations
 * and projects from the feature layer; this component owns no fetching or
 * persistence of the active selection.
 */
export function WorkspaceSwitcher({
  organizations,
  projects,
  activeOrganizationId,
  activeProjectId,
  collapsed,
  onSelectOrganization,
  onSelectProject,
  onCreateWorkspace,
  onSettingsClick,
}: WorkspaceSwitcherProps) {
  const activeOrg = organizations.find((org) => org.id === activeOrganizationId) ?? organizations[0];
  const orgProjects = projects.filter((project) => project.organizationId === activeOrg?.id);

  if (!activeOrg) return null;

  const trigger = (
    <Button
      variant="outline"
      className={cn(
        "h-auto w-full justify-start gap-2 border-sidebar-border bg-transparent px-2 py-1.5 hover:bg-sidebar-accent",
        collapsed && "justify-center px-0"
      )}
      aria-label={`Switch workspace, current: ${activeOrg.name}`}
    >
      <WorkspaceAvatar name={activeOrg.name} imageUrl={activeOrg.imageUrl} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-sidebar-foreground">
            {activeOrg.name}
          </span>
          <ChevronsUpDown size={iconSize.xs} className="shrink-0 text-text-muted" />
        </>
      )}
    </Button>
  );

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={trigger} />
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <WorkspaceItem
                key={org.id}
                name={org.name}
                imageUrl={org.imageUrl}
                meta={org.meta}
                active={org.id === activeOrg.id}
                onClick={() => onSelectOrganization?.(org.id)}
              />
            ))}
          </DropdownMenuGroup>

          {orgProjects.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
                  Projects
                </DropdownMenuLabel>
                {orgProjects.map((project) => (
                  <WorkspaceItem
                    key={project.id}
                    name={project.name}
                    imageUrl={project.imageUrl}
                    meta={project.meta}
                    active={project.id === activeProjectId}
                    onClick={() => onSelectProject?.(project.id)}
                  />
                ))}
              </DropdownMenuGroup>
            </>
          )}

          <DropdownMenuSeparator />
          <CreateWorkspaceButton onClick={onCreateWorkspace} />
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings size={iconSize.xs} /> Workspace settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
