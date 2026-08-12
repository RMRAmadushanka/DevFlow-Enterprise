"use client";

import * as React from "react";

import { Modal } from "@/components/feedback/modal";
import { AlertBanner } from "@/components/feedback/alert";
import { UserAvatar } from "@/components/data-display/avatars";
import { TextInput } from "@/components/forms/input";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, ROLES } from "@/lib/permissions";
import { useUserSearch } from "@/features/auth/hooks/use-user-search";
import { useOrganizationStore } from "@/features/organization";

import { useAddProjectMember } from "../hooks/use-projects";
import type { ProjectMember } from "../types/project.types";
import { toProjectErrorMessage } from "../utils/errors";

export interface InviteProjectMemberModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InviteProjectMemberModal({
  projectId,
  open,
  onOpenChange,
}: InviteProjectMemberModalProps) {
  const organizationId = useOrganizationStore((s) => s.currentOrganizationId);
  const addMember = useAddProjectMember(projectId);
  const [query, setQuery] = React.useState("");
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<ProjectMember["role"]>("developer");

  const search = useUserSearch({
    q: query,
    organizationId,
    enabled: open,
  });

  const selected = search.data?.find((u) => u.id === selectedUserId) ?? null;

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedUserId(null);
      setRole("developer");
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedUserId) return;
    await addMember.mutateAsync({ userId: selectedUserId, role });
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Invite member"
      description="Search organization members from the User Service, then add them to this project."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {addMember.error ? (
          <AlertBanner
            tone="error"
            title="Could not add member"
            description={toProjectErrorMessage(addMember.error)}
          />
        ) : null}

        <TextInput
          label="Search users"
          value={query}
          onChange={(value) => {
            setQuery(value);
            setSelectedUserId(null);
          }}
          placeholder="Name, email, or user id"
          autoComplete="off"
        />

        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
          {search.isFetching ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : null}
          {!search.isFetching && query.trim() && (search.data?.length ?? 0) === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">No users found</p>
          ) : null}
          {(search.data ?? []).map((user) => {
            const active = user.id === selectedUserId;
            return (
              <button
                key={user.id}
                type="button"
                className={
                  active
                    ? "flex w-full items-center gap-3 rounded-md bg-muted px-2 py-2 text-left"
                    : "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/60"
                }
                onClick={() => setSelectedUserId(user.id)}
              >
                <UserAvatar user={{ name: user.name, imageUrl: user.avatarUrl }} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{user.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.email || user.id}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <SelectField
          label="Role"
          value={role}
          onValueChange={(value) => setRole((value as ProjectMember["role"]) ?? "developer")}
          options={ROLES.filter((r) => r !== "owner").map((r) => ({
            value: r,
            label: ROLE_LABELS[r],
          }))}
        />

        {selected ? (
          <p className="text-xs text-muted-foreground">
            Selected: {selected.name}
            {selected.email ? ` (${selected.email})` : ""}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedUserId || addMember.isPending}>
            {addMember.isPending ? "Adding…" : "Add member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export { InviteProjectMemberModal };
