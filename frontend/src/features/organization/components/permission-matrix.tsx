"use client";

import * as React from "react";

import { SearchInput } from "@/components/forms/search-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { PermissionGuard } from "@/lib/permissions";
import { SkeletonTable } from "@/components/data-display/skeleton";

import {
  usePermissionMatrix,
  useSavePermissionMatrix,
} from "../hooks/use-organizations";
import type { PermissionMatrixState } from "../types/member.types";

export interface PermissionMatrixProps {
  organizationId: string;
}

function PermissionMatrix({ organizationId }: PermissionMatrixProps) {
  const { data, isLoading, isError } = usePermissionMatrix(organizationId);
  const save = useSavePermissionMatrix(organizationId);
  const [draft, setDraft] = React.useState<PermissionMatrixState | null>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!data) return;
    setDraft((current) => {
      if (
        current &&
        current.roles.length === data.roles.length &&
        current.rows.length === data.rows.length &&
        current.rows.every(
          (row, index) =>
            row.permission === data.rows[index]?.permission &&
            JSON.stringify(row.roles) === JSON.stringify(data.rows[index]?.roles)
        )
      ) {
        return current;
      }
      return data;
    });
  }, [data]);

  const filteredRows = React.useMemo(() => {
    if (!draft) return [];
    const q = query.trim().toLowerCase();
    if (!q) return draft.rows;
    return draft.rows.filter(
      (row) =>
        row.label.toLowerCase().includes(q) ||
        row.permission.toLowerCase().includes(q) ||
        row.group.toLowerCase().includes(q)
    );
  }, [draft, query]);

  if (isLoading) return <SkeletonTable rows={8} columns={6} aria-label="Loading permissions" />;

  if (isError || !draft) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Could not load permissions"
        description="Try refreshing the page."
      />
    );
  }

  if (draft.rows.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No roles"
        description="Define roles before editing the permission matrix."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4" data-slot="permission-matrix">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search permissions"
          label="Search permissions"
          className="max-w-sm"
        />
        <PermissionGuard permission="role.manage">
          <Button
            type="button"
            disabled={save.isPending}
            onClick={() => void save.mutateAsync(draft)}
          >
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </PermissionGuard>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">Permission matrix by role</caption>
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Permission
              </th>
              {draft.roles.map((role) => (
                <th key={role.key} scope="col" className="px-3 py-2 text-center font-medium">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.permission} className="border-t border-border">
                <th scope="row" className="px-3 py-2 text-left font-normal">
                  <div className="font-medium text-foreground">{row.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.group} · {row.permission}
                  </div>
                </th>
                {draft.roles.map((role) => (
                  <td key={role.key} className="px-3 py-2 text-center">
                    <Checkbox
                      checked={Boolean(row.roles[role.key])}
                      aria-label={`${row.label} for ${role.name}`}
                      onCheckedChange={(checked) => {
                        setDraft((current) => {
                          if (!current) return current;
                          return {
                            ...current,
                            rows: current.rows.map((item) =>
                              item.permission === row.permission
                                ? {
                                    ...item,
                                    roles: {
                                      ...item.roles,
                                      [role.key]: checked === true,
                                    },
                                  }
                                : item
                            ),
                          };
                        });
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { PermissionMatrix };
