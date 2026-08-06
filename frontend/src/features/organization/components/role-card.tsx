"use client";

import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/lib/permissions";

import type { OrgRoleDefinition } from "../types/member.types";
import { RoleBadge } from "./role-badge";

export interface RoleCardProps {
  role: OrgRoleDefinition;
  onDuplicate?: (role: OrgRoleDefinition) => void;
  onEdit?: (role: OrgRoleDefinition) => void;
  onDelete?: (role: OrgRoleDefinition) => void;
}

function RoleCard({ role, onDuplicate, onEdit, onDelete }: RoleCardProps) {
  return (
    <article
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      data-slot="role-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{role.name}</h3>
            {typeof role.key === "string" ? <RoleBadge role={role.key} size="sm" /> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" size="icon-sm" variant="ghost" aria-label={`Actions for ${role.name}`} />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <PermissionGuard permission="role.manage">
              <DropdownMenuItem onClick={() => onEdit?.(role)} disabled={role.isSystem}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(role)}>
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete?.(role)}
                disabled={role.isSystem}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>{role.permissions.length} permissions</span>
        <span aria-hidden="true">·</span>
        <span>{role.userCount} users</span>
        {role.isSystem ? (
          <>
            <span aria-hidden="true">·</span>
            <span>System role</span>
          </>
        ) : null}
      </div>
    </article>
  );
}

export { RoleCard };
