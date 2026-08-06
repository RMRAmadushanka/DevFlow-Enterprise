"use client";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { SkeletonCard } from "@/components/data-display/skeleton";
import { toast } from "@/components/feedback/toast";

import { useDuplicateRole, useRoles } from "../hooks/use-organizations";
import { RoleCard } from "./role-card";
import { PermissionMatrix } from "./permission-matrix";

export interface RoleManagementProps {
  organizationId: string;
}

function RoleManagement({ organizationId }: RoleManagementProps) {
  const { data = [], isLoading, isError } = useRoles(organizationId);
  const duplicate = useDuplicateRole(organizationId);

  return (
    <div className="flex flex-col gap-8" data-slot="role-management">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Roles</h2>
          <p className="text-sm text-muted-foreground">
            Default enterprise roles and how many members hold each one.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <FeatureEmptyState
            variant="no-results"
            title="Could not load roles"
            description="Try refreshing the page."
          />
        ) : data.length === 0 ? (
          <FeatureEmptyState
            variant="no-data"
            title="No roles"
            description="Roles will appear once the organization is configured."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onDuplicate={(item) => void duplicate.mutateAsync(String(item.key))}
                onEdit={() => toast.info("System roles are managed via the permission matrix")}
                onDelete={() => toast.info("System roles cannot be deleted")}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Permission matrix</h2>
          <p className="text-sm text-muted-foreground">
            Toggle permissions per role, then save your changes.
          </p>
        </div>
        <PermissionMatrix organizationId={organizationId} />
      </section>
    </div>
  );
}

export { RoleManagement };
