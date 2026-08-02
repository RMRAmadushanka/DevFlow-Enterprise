import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { iconSize } from "@/design-system/tokens/icons";
import { WorkspaceAvatar } from "./workspace-avatar";

export interface WorkspaceItemProps {
  name: string;
  imageUrl?: string;
  meta?: string;
  active?: boolean;
  onClick?: () => void;
}

/** A single organization or project row inside the workspace switcher dropdown. */
export function WorkspaceItem({ name, imageUrl, meta, active, onClick }: WorkspaceItemProps) {
  return (
    <DropdownMenuItem onClick={onClick} className="gap-2.5 py-1.5">
      <WorkspaceAvatar name={name} imageUrl={imageUrl} size="sm" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("truncate text-sm", active ? "font-medium text-text-primary" : "text-text-secondary")}>
          {name}
        </span>
        {meta && <span className="truncate text-xs text-text-muted">{meta}</span>}
      </span>
      {active && <Check size={iconSize.xs} className="shrink-0 text-primary" />}
    </DropdownMenuItem>
  );
}
