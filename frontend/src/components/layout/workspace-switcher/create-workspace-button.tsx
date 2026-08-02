import { Plus } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { iconSize } from "@/design-system/tokens/icons";

export interface CreateWorkspaceButtonProps {
  label?: string;
  onClick?: () => void;
}

export function CreateWorkspaceButton({ label = "Create workspace", onClick }: CreateWorkspaceButtonProps) {
  return (
    <DropdownMenuItem onClick={onClick} className="gap-2.5 text-text-secondary">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-border">
        <Plus size={iconSize.xs} />
      </span>
      {label}
    </DropdownMenuItem>
  );
}
