"use client";

import Link from "next/link";
import {
  Archive,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  Star,
} from "lucide-react";

import { toast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useToggleFavorite } from "../hooks/use-projects";
import type { Project } from "../types/project.types";

export interface ProjectQuickActionsProps {
  project: Project;
  onArchive?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
  compact?: boolean;
}

function ProjectQuickActions({
  project,
  onArchive,
  onDuplicate,
  compact,
}: ProjectQuickActionsProps) {
  const toggleFavorite = useToggleFavorite();

  async function copyLink() {
    const url = `${window.location.origin}${routes.app.project(project.id)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Project link copied");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            size={compact ? "icon-sm" : "icon-sm"}
            variant="ghost"
            aria-label={`Actions for ${project.name}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => void toggleFavorite.mutateAsync(project.id)}
        >
          <Star className="size-4" />
          {project.favorite ? "Unfavorite" : "Favorite"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void copyLink()}>
          <Link2 className="size-4" />
          Copy link
        </DropdownMenuItem>
        {project.repositoryUrl ? (
          <DropdownMenuItem
            render={<a href={project.repositoryUrl} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="size-4" />
            Open repository
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <PermissionGuard permission="project.create">
          <DropdownMenuItem onClick={() => onDuplicate?.(project)}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="project.update">
          <DropdownMenuItem render={<Link href={routes.app.projectEdit(project.id)} />}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="project.update">
          <DropdownMenuItem onClick={() => onArchive?.(project)}>
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ProjectQuickActions };
