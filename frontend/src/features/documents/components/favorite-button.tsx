"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PermissionGuard } from "@/lib/permissions";

import { useToggleFavorite } from "../hooks/use-documents";

export interface FavoriteButtonProps {
  documentId: string;
  favorited: boolean;
  size?: "sm" | "icon-sm" | "icon";
  className?: string;
}

function FavoriteButton({
  documentId,
  favorited,
  size = "icon-sm",
  className,
}: FavoriteButtonProps) {
  const toggle = useToggleFavorite();

  return (
    <PermissionGuard permission="document.update">
      <Button
        type="button"
        size={size}
        variant="ghost"
        className={cn(className)}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorited}
        disabled={toggle.isPending}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void toggle.mutateAsync(documentId);
        }}
      >
        <Star
          className={cn(
            "size-4",
            favorited ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
          )}
          aria-hidden
        />
      </Button>
    </PermissionGuard>
  );
}

export { FavoriteButton };
