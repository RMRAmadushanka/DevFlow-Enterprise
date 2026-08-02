import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { iconSize } from "@/design-system/tokens/icons";

export interface EmptyWorkspaceStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Shown in place of page content when a user has no organization/
 * workspace yet (e.g. right after sign-up, before onboarding). Centers
 * within whatever container it's placed in — typically `PageContainer`.
 */
export function EmptyWorkspaceState({
  title = "Create your first workspace",
  description = "Workspaces organize your projects, teams, and everything you build in DevFlow Enterprise.",
  actionLabel = "Create workspace",
  onAction,
}: EmptyWorkspaceStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary-muted text-primary">
        <Building2 size={iconSize.lg} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <Text variant="title" as="h2">
          {title}
        </Text>
        <Text tone="secondary" className="max-w-sm">
          {description}
        </Text>
      </div>
      {onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
