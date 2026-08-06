"use client";

import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/lib/permissions";

import type { Team } from "../types/member.types";

export interface TeamCardProps {
  team: Team;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4" data-slot="team-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{team.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {team.description || "No description"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" size="icon-sm" variant="ghost" aria-label={`Actions for ${team.name}`} />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <PermissionGuard permission="team.manage">
              <DropdownMenuItem onClick={() => onEdit?.(team)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(team)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="size-3.5" aria-hidden />
        {team.memberIds.length} members
      </p>
    </article>
  );
}

export { TeamCard };
