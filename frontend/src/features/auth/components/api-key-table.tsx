"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-display/table";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { PermissionGuard } from "@/lib/permissions";

import { useApiKeys, useRevokeApiKey } from "../hooks/use-account";
import type { ApiKeyRecord } from "../types/auth.types";
import { SessionSkeleton } from "./skeletons";
import { CreateApiKeyModal } from "./create-api-key-modal";
import { RevokeKeyModal } from "./revoke-key-modal";

function ApiKeyTable() {
  const { data = [], isLoading } = useApiKeys();
  const revoke = useRevokeApiKey();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [revokeTarget, setRevokeTarget] = React.useState<ApiKeyRecord | null>(null);

  const columns = React.useMemo<ColumnDef<ApiKeyRecord>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "prefix",
        header: "Key",
        cell: ({ getValue }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{String(getValue())}…</code>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      {
        accessorKey: "lastUsedAt",
        header: "Last used",
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? formatRelativeTime(String(value)) : "—";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <PermissionGuard permission="settings.manage">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => setRevokeTarget(row.original)}
            >
              Revoke
            </Button>
          </PermissionGuard>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Keys authenticate automation — treat secrets like passwords.
        </p>
        <PermissionGuard permission="settings.manage">
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            Create API key
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <SessionSkeleton />
      ) : data.length === 0 ? (
        <FeatureEmptyState
          variant="no-data"
          title="No API keys"
          description="Create a key for CI or integrations."
          action={
            <PermissionGuard permission="settings.manage">
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                Create API key
              </Button>
            </PermissionGuard>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          enablePagination={false}
          density="compact"
          noun="keys"
        />
      )}

      <CreateApiKeyModal open={createOpen} onOpenChange={setCreateOpen} />
      <RevokeKeyModal
        apiKey={revokeTarget}
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        onConfirm={async () => {
          if (!revokeTarget) return;
          await revoke.mutateAsync(revokeTarget.id);
          setRevokeTarget(null);
        }}
        loading={revoke.isPending}
      />
    </div>
  );
}

export { ApiKeyTable };
