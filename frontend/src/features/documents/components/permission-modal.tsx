"use client";

import { UserAvatar } from "@/components/data-display/avatars";
import { StatusBadge } from "@/components/data-display/badges";
import { Modal } from "@/components/feedback/modal";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import type {
  DocumentAccessRole,
  DocumentDetail,
  DocumentPermissionEntry,
} from "../types/document.types";

const ROLE_LABELS: Record<DocumentAccessRole, string> = {
  owner: "Owner",
  editor: "Editor",
  commenter: "Commenter",
  viewer: "Viewer",
};

const ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer" },
  { value: "commenter", label: "Commenter" },
  { value: "editor", label: "Editor" },
  { value: "owner", label: "Owner" },
];

export interface PermissionsPanelProps {
  permissions: DocumentPermissionEntry[];
  onRoleChange?: (entryId: string, role: DocumentAccessRole) => void;
  className?: string;
}

function PermissionsPanel({ permissions, onRoleChange, className }: PermissionsPanelProps) {
  if (permissions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Only the owner has access right now.
      </p>
    );
  }

  return (
    <ul className={className} aria-label="Document permissions" data-slot="permissions-panel">
      {permissions.map((entry) => (
        <li
          key={entry.id}
          className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="inline-flex items-center gap-2 text-sm">
            <UserAvatar
              user={{
                id: entry.userId,
                name: entry.userName,
                imageUrl: entry.avatarUrl,
              }}
              size="sm"
            />
            <span className="font-medium text-foreground">{entry.userName}</span>
            {entry.role === "owner" ? (
              <StatusBadge tone="info" size="sm">
                {ROLE_LABELS[entry.role]}
              </StatusBadge>
            ) : null}
          </span>
          {entry.role !== "owner" && onRoleChange ? (
            <PermissionGuard permission="document.update">
              <SelectField
                label={`Role for ${entry.userName}`}
                value={entry.role}
                onValueChange={(value) => {
                  if (value) onRoleChange(entry.id, value as DocumentAccessRole);
                }}
                options={ROLE_OPTIONS.filter((o) => o.value !== "owner")}
                className="w-[160px]"
                size="sm"
              />
            </PermissionGuard>
          ) : entry.role !== "owner" ? (
            <StatusBadge tone="neutral" size="sm">
              {ROLE_LABELS[entry.role]}
            </StatusBadge>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export interface PermissionModalProps {
  document: DocumentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PermissionModal({ document: doc, open, onOpenChange }: PermissionModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Manage permissions"
      description={doc ? `People with access to “${doc.title}”.` : undefined}
    >
      {doc ? <PermissionsPanel permissions={doc.permissions} /> : null}
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

export { PermissionModal, PermissionsPanel };
