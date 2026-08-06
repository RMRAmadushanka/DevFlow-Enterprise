"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useToggleFavorite } from "../hooks/use-projects";

export interface FavoriteProjectButtonProps {
  projectId: string;
  favorite: boolean;
  className?: string;
}

function FavoriteProjectButton({ projectId, favorite, className }: FavoriteProjectButtonProps) {
  const toggle = useToggleFavorite();

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className={className}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorite}
      disabled={toggle.isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle.mutateAsync(projectId);
      }}
    >
      <Star
        className={cn("size-4", favorite ? "fill-warning text-warning" : "text-muted-foreground")}
      />
    </Button>
  );
}

export { FavoriteProjectButton };
