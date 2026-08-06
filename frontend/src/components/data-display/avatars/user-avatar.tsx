import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { getInitials, getFallbackColorClassName } from "./utils";
import type { AvatarStatus, UserAvatarProps } from "./types";

const statusClassName: Record<AvatarStatus, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-danger",
  offline: "bg-muted-foreground",
};

/**
 * A person's avatar — image when available, initials fallback otherwise
 * (colored deterministically from the name), with an optional presence dot.
 * Thin wrapper around the `Avatar` primitive; use that directly for
 * non-person avatars (teams, bots, generic icons).
 */
function UserAvatar({ user, size = "default", status, className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={user.name} /> : null}
      <AvatarFallback className={cn(getFallbackColorClassName(user.name), "font-medium")}>
        {getInitials(user.name)}
      </AvatarFallback>
      {status ? (
        <AvatarBadge className={statusClassName[status]} aria-label={`Status: ${status}`} role="img" />
      ) : null}
    </Avatar>
  );
}

export { UserAvatar };
